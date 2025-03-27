"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useRef, useState } from "react";
import { getFlashcardGroup, handleGenerate } from "../_actions/generate";
import { Error, isError } from "@/lib/utils";
import { InputFormat, InputType } from "@/lib/types";
import { redirect } from "next/navigation";

type GenerateError = {
  format?: string[];
  text?: string[];
  pdf?: string[];
  pptx?: string[];
  image?: string[];
  university?: string[];
  department?: string[];
  courseNumber?: string[];
  courseName?: string[];
  error?: string;
};

type GenerateFormProps = {
  userId: string;
};

const POLL_INTERVAL = 5000;
const MAX_POLL_COUNT = 12; // one minute

export default function GenerateForm({ userId }: GenerateFormProps) {
  const [groupId] = useState(crypto.randomUUID());
  const isPolling = useRef(false);
  const [inputType, setInputType] = useState<InputType>("notes");
  const [error, action, isPending] = useActionState(
    handleGenerate.bind(null, groupId, userId, inputType),
    {}
  );
  const [pollTimeoutError, setPollTimeoutError] = useState<string | null>(null);

  async function pollResource(groupId: string, depth = 0) {
    if (depth !== 0 && !isPolling) return;
    const exists = await getFlashcardGroup(groupId);
    if (exists) {
      redirect(`/flashcards/${groupId}`);
    }
    if (depth < MAX_POLL_COUNT) {
      setTimeout(() => pollResource(groupId, depth + 1), POLL_INTERVAL);
    } else {
      isPolling.current = false;
      setPollTimeoutError(
        "Failed to get a response from the server in time, please check your flashcard groups to see if your flashcards have been generated"
      );
    }
  }

  useEffect(() => {
    if (isPending && !isPolling.current) {
      isPolling.current = true;
      pollResource(groupId);
    }
  }, [isPending, isPolling, pollResource]);

  useEffect(() => {
    if (isError(error)) {
      isPolling.current = false;
    }
  }, [error]);

  function renderInput() {
    switch (inputType) {
      case "notes":
        return <NotesInput error={error} />;
      case "syllabus":
        return <SyllabusInput error={error} />;
      case "courseInfo":
        return <CourseInfoInput error={error} />;
    }
  }

  function getDescription() {
    switch (inputType) {
      case "notes":
        return "Upload a pdf, powerpoint, or just paste your notes to generate flashcards. Please note that handwritten notes are not supported at this time.";
      case "syllabus":
        return "Upload a pdf, powerpoint, or just paste your syllabus to generate flashcards.";
      case "courseInfo":
        return "Enter some information about your course to generate flashcards.";
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex justify-between items-center">
          <span>Information</span>
          <div className="flex gap-2">
            <Button
              variant={inputType === "notes" ? "default" : "outline"}
              onClick={() => setInputType("notes")}
            >
              Notes
            </Button>
            <Button
              variant={inputType === "syllabus" ? "default" : "outline"}
              onClick={() => setInputType("syllabus")}
            >
              Syllabus
            </Button>
            <Button
              variant={inputType === "courseInfo" ? "default" : "outline"}
              onClick={() => setInputType("courseInfo")}
            >
              Course Info
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-2">
          {renderInput()}
          <Button
            type="submit"
            className="mt-6"
            disabled={isPolling.current || isPending}
          >
            {isPolling.current || isPending ? "Generating..." : "Generate"}
          </Button>
          {(error as Error).error && (
            <p className="text-destructive">{(error as Error).error}</p>
          )}
          {!(error as Error).error && pollTimeoutError && (
            <p className="text-destructive">{pollTimeoutError}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

type InputProps = {
  error: GenerateError;
};

function NotesInput({ error }: InputProps) {
  const [format, setFormat] = useState<InputFormat>("pdf");

  function renderInput() {
    switch (format) {
      case "text":
        return (
          <>
            <Textarea name="text" id="text" required />
            {error.text && <p className="text-destructive">{error.text}</p>}
          </>
        );
      case "pdf":
        return (
          <>
            <Input type="file" name="pdf" id="pdf" accept=".pdf" required />
            {error.pdf && <p className="text-destructive">{error.pdf}</p>}
          </>
        );
      case "pptx":
        return (
          <>
            <Input type="file" name="pptx" id="pptx" accept=".pptx" required />
            {error.pptx && <p className="text-destructive">{error.pptx}</p>}
          </>
        );
      case "image":
        return (
          <>
            <Input
              type="file"
              name="image"
              id="image"
              accept="image/png, image/jpeg, image/jpg"
              required
            />
            {error.image && <p className="text-destructive">{error.image}</p>}
          </>
        );
    }
  }

  return (
    <>
      <div className="flex justify-between">
        <Label
          htmlFor={
            format === "text" ? "text" : format === "pdf" ? "pdf" : "pptx"
          }
        >
          Notes
        </Label>
        <Select
          name="format"
          required
          value={format}
          onValueChange={(e) => setFormat(e as InputFormat)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an Input Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Formats</SelectLabel>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="pptx">Power Point</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {error.format && <p className="text-destructive">{error.format}</p>}
      {renderInput()}
    </>
  );
}

function SyllabusInput({ error }: InputProps) {
  const [format, setFormat] = useState<InputFormat>("pdf");

  function renderInput() {
    switch (format) {
      case "text":
        return (
          <>
            <Textarea name="text" id="text" required />
            {error.text && <p className="text-destructive">{error.text}</p>}
          </>
        );
      case "pdf":
        return (
          <>
            <Input type="file" name="pdf" id="pdf" accept=".pdf" required />
            {error.pdf && <p className="text-destructive">{error.pdf}</p>}
          </>
        );
    }
  }

  return (
    <>
      <div className="flex justify-between">
        <Label
          htmlFor={
            format === "text" ? "text" : format === "pdf" ? "pdf" : "pptx"
          }
        >
          Syllabus
        </Label>
        <Select
          name="format"
          required
          value={format}
          onValueChange={(e) => {
            setFormat(e as InputFormat);
            console.log(e);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an Input Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Formats</SelectLabel>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {error.format && <p className="text-destructive">{error.format}</p>}
      {renderInput()}
    </>
  );
}

function CourseInfoInput({ error }: InputProps) {
  return (
    <>
      <Label htmlFor="university">University</Label>
      <Input
        type="text"
        name="university"
        id="university"
        required
        placeholder="University of South Carolina"
      />
      {error.university && (
        <p className="text-destructive">{error.university}</p>
      )}
      <Label htmlFor="department">Department</Label>
      <Input
        type="text"
        name="department"
        id="department"
        required
        placeholder="Computer Science"
      />
      {error.department && (
        <p className="text-destructive">{error.department}</p>
      )}
      <Label htmlFor="courseNumber">Course Number</Label>
      <Input
        type="text"
        name="courseNumber"
        id="courseNumber"
        required
        placeholder="CSCE 350"
      />
      {error.courseNumber && (
        <p className="text-destructive">{error.courseNumber}</p>
      )}
      <Label htmlFor="courseName">Course Name</Label>
      <Input
        type="text"
        name="courseName"
        id="courseName"
        required
        placeholder="Data Structures and Algorithms"
      />
      {error.courseName && (
        <p className="text-destructive">{error.courseName}</p>
      )}
    </>
  );
}
