import React from "react";
import Footer from "@/components/template/Footer";
import InitialIcons from "@/components/template/InitialIcons";
import BaseLayout from '@/layouts/BaseLayout';

export default function HomePage() {
  return (
    <BaseLayout>
      <InitialIcons />
      <Footer />
    </BaseLayout>
  );
}
