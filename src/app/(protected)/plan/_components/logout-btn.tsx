"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "../_actions/auth";

export default function LogoutBtn() {
  return (
    <Button onClick={logout} className="w-fit">
      <span>Logout</span>
      <LogOut />
    </Button>
  );
}
