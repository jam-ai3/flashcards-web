"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useState } from "react";
import { sendEmail } from "../_actions/email";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ContactFormProps = {
  title?: string;
  description?: string;
};

type EmailError = {
  name?: string[] | undefined;
  email?: string[] | undefined;
  message?: string[] | undefined;
  error?: string | undefined;
};

export function ContactForm({ title, description }: ContactFormProps) {
  const [error, action, isPending]: [
    EmailError,
    (payload: FormData) => void,
    boolean
  ] = useActionState(sendEmail, {});
  const [sendStatus, setSendStatus] = useState<
    "success" | "error" | "none" | "sending"
  >("none");

  useEffect(() => {
    if (isPending) return setSendStatus("sending");
    if (error.name || error.email || error.message)
      return setSendStatus("none");
    if (error.error) return setSendStatus("error");
    if (sendStatus === "sending") return setSendStatus("success");
  }, [isPending]);

  function getButtonText() {
    switch (sendStatus) {
      case "success":
        return "Sent";
      case "error":
        return "Error";
      case "none":
        return "Send";
      case "sending":
        return "Sending...";
    }
  }

  function getButtonIcon() {
    switch (sendStatus) {
      case "success":
        return <Mail className="w-4 h-4" />;
      case "error":
        return <Mail className="w-4 h-4" />;
      case "none":
        return <Mail className="w-4 h-4" />;
      case "sending":
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  }

  return (
    <Card className="bg-secondary">
      {title && (
        <CardHeader>
          <CardTitle>
            <p className="text-xl font-semibold">{title}</p>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="John Doe" name="name" />
              {error.name && <p className="text-destructive">{error.name}</p>}
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="email">Email</Label>
              <Input type="email" placeholder="jdoe@email.com" name="email" />
              {error.email && <p className="text-destructive">{error.email}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              placeholder="Message"
              name="message"
              className="resize-none min-h-[128px]"
            />
            {error.message && (
              <p className="text-destructive">{error.message}</p>
            )}
          </div>
          <Button type="submit" disabled={sendStatus !== "none"}>
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </Button>
          {error.error && <p className="text-destructive">{error.error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
