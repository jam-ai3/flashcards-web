"use client";

import { Button } from "@/components/ui/button";
import { cancelSubscription } from "../_actions/stripe";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CancelSubscriptionBtnProps = {
  stripeId: string;
};

export default function CancelSubscriptionBtn({
  stripeId,
}: CancelSubscriptionBtnProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    await cancelSubscription(stripeId);
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
      {loading ? <span>Loading...</span> : <span>Cancel Subscription</span>}
    </Button>
  );
}
