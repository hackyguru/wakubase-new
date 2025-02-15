import React, { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Menu, Plus, Check, MoreVertical, Sun, Moon, X, ChevronDown, Globe, Settings, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { HealthIndicator } from "@/components/ui/health-indicator";
import { useNodeHealth } from "@/hooks/useNodeHealth";
import { useSettings } from '@/hooks/useSettings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useContentTopics } from '@/hooks/useContentTopics';
import { useContentData } from '@/hooks/useContentData';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { getNodeUrl } from '@/store/settings';
import axios from 'axios';

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

const backdropVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const webhookUrl = "/appname/1/category/proto";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isNewWebhookOpen, setIsNewWebhookOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [showCopiedCheck, setShowCopiedCheck] = useState(false);
  const [outgoingMessage, setOutgoingMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const {
    nodeType,
    nodeUrl,
    networkType,
    customNetworkUrl,
    autoSelectNew,
    theme: storedTheme,
    updateSettings,
    defaultSettings,
  } = useSettings();

  const [isDark, setIsDark] = useState(false);
  const isHealthy = useNodeHealth();
  const { topics, selectedTopicId, setSelectedTopicId, addTopic, deleteTopic } = useContentTopics();
  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const { data: contentData, error: contentError, clearData, deleteMessage } = useContentData(selectedTopicId, selectedTopic?.topic);

  useEffect(() => {
    // Initialize theme state from stored settings
    setIsDark(storedTheme === 'dark');
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [storedTheme]);

  const handleValueChange = (value: string) => {
    if (value === 'new') {
      setNewTopicDialogOpen(true);
    } else {
      setSelectedTopicId(value);
    }
  };

  const handleDeleteTopic = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    deleteTopic(id);
  };

  const handleCreateTopic = () => {
    if (newTopic.trim()) {
      addTopic(newTopic.trim());
      setNewTopic('');
      setNewTopicDialogOpen(false);
    }
  };

  const handleCopyTopic = async () => {
    const selectedTopic = topics.find(topic => topic.id === selectedTopicId);
    if (selectedTopic) {
      await navigator.clipboard.writeText(selectedTopic.topic);
      setShowCopiedCheck(true);
      setTimeout(() => setShowCopiedCheck(false), 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!outgoingMessage.trim() || !selectedTopicId) return;
    
    const selectedTopic = topics.find(t => t.id === selectedTopicId);
    if (!selectedTopic) return;

    setIsSending(true);
    setSendError(null);
    
    try {
      const nodeUrl = getNodeUrl();
      const encodedMessage = btoa(outgoingMessage.trim());
      
      await axios.post(
        `${nodeUrl}/relay/v1/auto/messages`,
        {
          payload: encodedMessage,
          contentTopic: selectedTopic.topic,
          timestamp: Date.now()
        }
      );

      setOutgoingMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setSendError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background/30 text-foreground backdrop-blur-xl">
      {/* Title bar for window dragging */}
      <div className="flex h-[52px]">
        {/* Sidebar title section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-[320px] md:w-[400px] drag-region bg-[hsl(var(--sidebar-background))] flex items-center px-4 border-r border-white/10"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden no-drag"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </motion.div>
        
        {/* Content title section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 drag-region bg-[hsl(var(--content-background))]"
        />

        {/* Right border and spacing in title bar */}
        <div className="flex h-full border-l border-white/10">
          <div className="w-10 bg-[hsl(var(--sidebar-background))]" />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate={isSidebarOpen ? "open" : "closed"}
            className={`
              fixed md:relative
              z-20 md:z-0
              w-[320px] md:w-[400px]
              h-[calc(100vh-52px)]
              border-r border-white/10
              bg-[hsl(var(--sidebar-background))]
              p-4
              flex
              flex-col
              backdrop-blur-md
              md:translate-x-0
            `}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">📡</span>
                <h1 className="text-xl inter-semibold">Waku</h1>
                <h1 className="text-xl inter-thin">Base</h1>
              </div>
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-[220px] bg-[hsl(var(--sidebar-background))] border-white/10"
                >
                  <DropdownMenuLabel className="text-sm text-muted-foreground inter-medium">
                    Selecting
                  </DropdownMenuLabel>
                  <div className="px-2 py-1.5 flex items-center justify-between hover:bg-white/5 rounded-lg">
                    <span className="text-sm inter-regular">Auto-select new requests</span>
                    <Switch
                      checked={autoSelectNew}
                      onCheckedChange={(checked) => updateSettings({ autoSelectNew: checked })}
                    />
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuLabel className="text-sm text-muted-foreground inter-medium">
                    Share this webhook
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => {
                      handleCopyTopic();
                    }}
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center justify-between hover:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {showCopiedCheck ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-400 hover:bg-white/5 rounded-lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    <span className="inter-regular">Delete this webhook</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 w-full"
            >
              <div className="relative w-full">
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    handleCopyTopic();
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-white/5 flex items-center justify-center cursor-pointer rounded-md z-10"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showCopiedCheck ? "check" : "copy"}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showCopiedCheck ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Select value={selectedTopicId || ''} onValueChange={handleValueChange}>
                  <SelectTrigger className="bg-[hsl(var(--content-background))] border-white/10 pr-[4.5rem] inter-regular rounded-lg px-3 py-2.5">
                    <div className="flex items-center w-full">
                      <SelectValue placeholder="Select content topic">
                        {topics.find(t => t.id === selectedTopicId)?.topic || 'Select content topic'}
                      </SelectValue>
                    </div>
                    <div className="absolute right-2 flex items-center">
                      <div className="h-7 w-7 flex items-center justify-center">
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="inter-regular bg-[hsl(var(--content-background))] border-white/10 rounded-lg p-1.5">
                    {topics.map((topic) => (
                      <div key={topic.id} className="relative group">
                        <SelectItem 
                          value={topic.id}
                          className="flex items-center hover:bg-white/5 rounded-lg px-3 py-2 [&>span:first-child]:hidden pr-8"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>{topic.topic}</span>
                          </div>
                        </SelectItem>
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-md flex items-center justify-center cursor-pointer transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteTopic(topic.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteTopic(topic.id);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                    <SelectItem 
                      value="new"
                      className="text-muted-foreground flex items-center hover:bg-white/5 rounded-lg px-3 py-2 [&>span:first-child]:hidden"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Plus className="h-4 w-4" />
                        <span>New content topic</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <div className="mt-6 mb-4 border-t border-white/10" />

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-1 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-2.5 mb-2">
                <h3 className="text-sm text-muted-foreground inter-medium">Incoming Data</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-white/5"
                  onClick={() => clearData()}
                  disabled={!selectedTopicId || contentData.length === 0}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              {contentError && (
                <div className="px-2.5 py-2 text-sm text-red-500">
                  {contentError}
                </div>
              )}
              {(!selectedTopicId || contentData.length === 0) && !contentError && (
                <div className="px-2.5 py-2 text-sm text-muted-foreground">
                  No data available
                </div>
              )}
              <div className="space-y-1.5">
                {contentData.map((item, index) => (
                  <div 
                    key={item.timestamp}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200",
                      index === 0 
                        ? "bg-[#f6f6f4] dark:bg-[#1e1e1c]" 
                        : "bg-gradient-to-b from-[#f6f6f4]/50 to-[#f6f6f4]/20 dark:from-[#1e1e1c]/50 dark:to-[#1e1e1c]/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm inter-regular">
                        {atob(item.payload)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground inter-regular">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(item.timestamp);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Add the outgoing data section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto pt-4 border-t border-white/10"
            >
              <div className="flex items-center justify-between px-2.5 mb-2">
                <h3 className="text-sm text-muted-foreground inter-medium">Outgoing Data</h3>
                {selectedTopicId && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">⌘ + ↵</span>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!outgoingMessage.trim() || isSending}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-white/5"
                    >
                      {isSending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {!selectedTopicId ? (
                <div className="px-2.5 py-2 text-sm text-muted-foreground">
                  Select a topic to send data
                </div>
              ) : (
                <div className="px-2.5 space-y-2">
                  {sendError && (
                    <div className="text-sm text-red-500">
                      {sendError}
                    </div>
                  )}
                  <Textarea
                    value={outgoingMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      // Try to format JSON if the input is valid JSON
                      try {
                        const jsonData = JSON.parse(e.target.value);
                        setOutgoingMessage(JSON.stringify(jsonData, null, 2));
                      } catch {
                        // If not valid JSON, just set the raw value
                        setOutgoingMessage(e.target.value);
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Enter JSON message..."
                    className="flex-1 min-h-[100px] font-mono text-sm bg-[hsl(var(--content-background))] border-white/10 resize-y"
                    disabled={isSending}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Backdrop for mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-10 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main content area */}
        <motion.div 
          className="flex-1 overflow-auto p-4 md:p-8 bg-[hsl(var(--content-background))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto text-center gap-6"
          >
            <motion.span 
              className="text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              📡
            </motion.span>
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold inter-semibold">
                Wakubase allows you to receive and inspect p2p content topics.
              </h2>
              <p className="text-muted-foreground inter-regular">
                Use your unique webhook URL to send any webhook to it.
              </p>
            </motion.div>
            <motion.div 
              className="text-sm text-muted-foreground mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="inter-regular">Popular services that send webhooks: Shopify, Slack, Mailchimp, Trello, GitHub, PayPal, Discord, Jira.</p>
              <p className="mt-4 inter-regular">Webhooks are deleted after 7 days of inactivity.</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right border and icons */}
        <div className="flex h-[calc(100vh-52px)] border-l border-white/10">
          <div className="w-10 bg-[hsl(var(--sidebar-background))] flex flex-col">
            <div className="flex justify-center pt-4">
              <HealthIndicator isHealthy={isHealthy.isHealthy} isChecking={isHealthy.isChecking} />
            </div>
            <div className="flex flex-col items-center gap-2 mt-auto pb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-white/5"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                <Globe className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-white/5 relative"
                onClick={() => {
                  const newTheme = isDark ? 'light' : 'dark';
                  updateSettings({ theme: newTheme });
                  setIsDark(!isDark);
                  document.documentElement.classList.toggle('dark');
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {isDark ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="bg-[hsl(var(--sidebar-background))] border-white/10">
          <SheetHeader>
            <SheetTitle className="text-xl inter-semibold">Settings</SheetTitle>
            <SheetDescription className="text-muted-foreground inter-regular">
              Configure your webhook settings and preferences.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium inter-medium">Node Configuration</h3>
              <Tabs 
                defaultValue={nodeType} 
                onValueChange={(value) => updateSettings({ nodeType: value as 'full' | 'light' })} 
                className="w-full"
              >
                <TabsList className="w-full bg-[hsl(var(--content-background))] border-white/10">
                  <TabsTrigger value="full" className="w-full">Full Node</TabsTrigger>
                  <TabsTrigger value="light" className="w-full">Light Node</TabsTrigger>
                </TabsList>
                <TabsContent value="full" className="mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground inter-regular">Node URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={nodeUrl}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            updateSettings({ nodeUrl: newUrl });
                          }}
                          className="flex-1 bg-[hsl(var(--content-background))] border-white/10"
                          placeholder="Enter node URL"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            // Reset just the node URL to default
                            updateSettings({ nodeUrl: defaultSettings.nodeUrl });
                          }}
                          className="whitespace-nowrap"
                        >
                          Reset URL
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current node URL: {nodeUrl}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="light" className="mt-4">
                  <div className="space-y-4">
                    <Select
                      value={networkType}
                      onValueChange={(value) => updateSettings({ networkType: value as 'bootstrap' | 'custom' })}
                    >
                      <SelectTrigger className="bg-[hsl(var(--content-background))] border-white/10">
                        <SelectValue placeholder="Select network type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(var(--sidebar-background))] border-white/10">
                        <SelectItem value="bootstrap">Bootstrap Network</SelectItem>
                        <SelectItem value="custom">Custom Network</SelectItem>
                      </SelectContent>
                    </Select>
                    {networkType === "custom" && (
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground inter-regular">Custom Network URL</label>
                        <Input
                          value={customNetworkUrl}
                          onChange={(e) => updateSettings({ customNetworkUrl: e.target.value })}
                          className="bg-[hsl(var(--content-background))] border-white/10"
                          placeholder="Enter custom network URL"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium inter-medium">General Settings</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm inter-regular">Auto-select new requests</span>
                <Switch
                  checked={autoSelectNew}
                  onCheckedChange={(checked) => updateSettings({ autoSelectNew: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm inter-regular">Theme</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-white/5"
                  onClick={() => {
                    const newTheme = isDark ? 'light' : 'dark';
                    updateSettings({ theme: newTheme });
                    setIsDark(!isDark);
                    document.documentElement.classList.toggle('dark');
                  }}
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Webhook Modal */}
      <AnimatePresence>
        {isNewWebhookOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsNewWebhookOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[hsl(var(--sidebar-background))] p-6 rounded-lg shadow-lg z-50"
            >
              <h2 className="text-lg inter-semibold mb-4">Create New Webhook</h2>
              <div className="space-y-4">
                {/* Add your form fields here */}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsNewWebhookOpen(false)} className="inter-medium">
                    Cancel
                  </Button>
                  <Button className="inter-medium">
                    Create Webhook
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Topic Dialog */}
      <Dialog open={newTopicDialogOpen} onOpenChange={setNewTopicDialogOpen}>
        <DialogContent className="bg-[hsl(var(--sidebar-background))] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl inter-semibold">New Content Topic</DialogTitle>
            <DialogDescription className="text-muted-foreground inter-regular">
              Create a new content topic to monitor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground inter-regular">
                Topic Name
              </label>
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Enter topic name"
                className="bg-[hsl(var(--content-background))] border-white/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTopic.trim()) {
                    handleCreateTopic();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNewTopicDialogOpen(false);
                setNewTopic('');
              }}
              className="inter-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTopic}
              className="inter-medium"
              disabled={!newTopic.trim()}
            >
              Create Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
