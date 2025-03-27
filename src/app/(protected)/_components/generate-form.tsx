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
import {
  FormEvent,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getFlashcardGroup, handleGenerate } from "../_actions/generate";
import { CustomError, isError } from "@/lib/utils";
import { InputFormat, InputType } from "@/lib/types";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  const [isPolling, setIsPolling] = useState(false);
  const [inputType, setInputType] = useState<InputType>("notes");
  const [error, action, isPending] = useActionState(
    handleGenerate.bind(null, groupId, userId, inputType),
    {}
  );
  const [pollTimeoutError, setPollTimeoutError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  async function pollResource(groupId: string, depth = 0) {
    const exists = await getFlashcardGroup(groupId);
    console.log(exists, groupId);
    if (exists) redirect(`/flashcards/${groupId}`);

    if (depth < MAX_POLL_COUNT) {
      if (pollRef.current) clearTimeout(pollRef.current);

      pollRef.current = setTimeout(
        () => pollResource(groupId, depth + 1),
        POLL_INTERVAL
      );
    } else {
      setIsPolling(false);
      setPollTimeoutError(
        "Failed to get a response from the server in time, please check your flashcard groups to see if your flashcards have been generated"
      );
    }
  }

  const startPolling = useCallback(() => {
    if (isPolling) return;
    setIsPolling(true);
    pollResource(groupId);
  }, [groupId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollRef.current) {
      clearTimeout(pollRef.current);
    }
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => action(new FormData(e.currentTarget)));
  }

  useEffect(() => {
    if (isPending && !isPolling) {
      startPolling();
    }
  }, [isPending, isPolling, pollResource]);

  useEffect(() => {
    if (isError(error)) {
      stopPolling();
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {renderInput()}
          <Button
            type="submit"
            className="mt-6"
            disabled={isPolling || isPending}
          >
            {(isPolling || isPending) && <Loader2 className="animate-spin" />}
            <span>{isPolling || isPending ? "Generating..." : "Generate"}</span>
          </Button>
          {(error as CustomError).error && (
            <p className="text-destructive">{(error as CustomError).error}</p>
          )}
          {!(error as CustomError).error && pollTimeoutError && (
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
            <Textarea name="text" id="text" required className="resize-none" />
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
              {/* <SelectItem value="pptx">Power Point</SelectItem> */}
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
            <Textarea name="text" id="text" required className="resize-none" />
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
