import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's default body parser to handle multipart form data
  },
};

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const taskNumber = formData.get("taskNumber");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Ensure taskNumber is valid
    if (!taskNumber || isNaN(Number(taskNumber)) || Number(taskNumber) <= 0) {
      return NextResponse.json(
        { error: "Invalid task number provided" },
        { status: 400 }
      );
    }

    // Validate file type (must be a ZIP archive)
    if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Uploaded file is not a ZIP archive" },
        { status: 400 }
      );
    }

    // Validate file size (500 MB limit)
    const maxSizeInBytes = 500 * 1024 * 1024; // 500 MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: "Uploaded file exceeds the maximum size of 500 MB" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Define the upload directory using the task number:
    // public/uploads/tasks/task_<number>
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "tasks",
      `task_${taskNumber}`
    );

    // Ensure upload directory exists (create it if it doesn't)
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Save the file in this directory
    const filePath = path.join(uploadDir, file.name);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      fileName: file.name,
      taskDirectory: `tasks/task_${taskNumber}`,
      filePath,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
