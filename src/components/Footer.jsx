/* eslint-disable no-unused-vars */
import React from "react";
import { Separator } from "@/components/ui/separator"

const Footer = () => {
  return (
    <footer className="w-full">
      <Separator className="mt-8"/>
      <div className="pt-2">
        <p className="text-primary tracking-tight">
          Developed by{" "}
          <a
            href="https://github.com/aakashgujar"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold"
          >
            Aakash
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;