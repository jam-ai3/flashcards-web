"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteGroup } from "../_actions/delete";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type DeleteButtonProps = {
  groupId: string;
};

export default function DeleteButton({ groupId }: DeleteButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    try {
      await deleteGroup(groupId);
      router.refresh();
    } catch {}
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this set?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            flashcard set.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleDelete} variant="destructive">
          Delete
        </Button>
      </DialogContent>
    </Dialog>
  );
}
