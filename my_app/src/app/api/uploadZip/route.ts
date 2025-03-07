import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";

export const config = {
  api: {
    bodyParser: false, // Handle multipart/form-data manually
  },
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function updateDatasetJson(datasetDir: string, addedFiles: string[]) {
  const datasetJsonPath = path.join(datasetDir, "dataset.json");
  let datasetJson: { name: string; training: Array<{ image: string; label?: string }> } = {
    name: path.basename(datasetDir),
    training: []
  };

  // Try to read existing dataset.json
  if (await exists(datasetJsonPath)) {
    try {
      const content = await fs.readFile(datasetJsonPath, "utf-8");
      const parsedJson = JSON.parse(content);
      // Ensure the parsed JSON has the expected structure
      if (parsedJson.name && Array.isArray(parsedJson.training)) {
        datasetJson = parsedJson;
      }
    } catch (error) {
      console.error("Error reading or parsing dataset.json", error);
    }
  }

  // Append new image entries if they do not already exist
  for (const file of addedFiles) {
    const imageEntry = `./imagesTr/${file}`;
    const labelEntry = `./labelsTr/${file}`;
    
    if (!datasetJson.training.some(entry => entry.image === imageEntry)) {
      const newEntry: { image: string; label?: string } = { image: imageEntry };
      
      // Only add the label if it actually exists
      if (await exists(path.join(datasetDir, labelEntry))) {
        newEntry.label = labelEntry;
      }
      
      datasetJson.training.push(newEntry);
    }
  }

  // Write updated JSON back to file
  await fs.writeFile(datasetJsonPath, JSON.stringify(datasetJson, null, 2), "utf-8");
}


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const datasetNameRaw = formData.get("datasetName") as string;
    const file = formData.get("file") as File;

    if (!datasetNameRaw || !datasetNameRaw.trim()) {
      return NextResponse.json({ error: "Invalid dataset name" }, { status: 400 });
    }
    const datasetName = datasetNameRaw.trim();

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // Validate the ZIP file type
    if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "Uploaded file is not a ZIP archive" }, { status: 400 });
    }

    // Convert the File into a Buffer.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Base directory is nnUNet_raw as defined
    const baseDir = path.join(process.cwd(), "nnUNet_raw");
    const datasetDir = path.join(baseDir, datasetName);
    if (!(await exists(datasetDir))) {
      return NextResponse.json({ error: "Dataset does not exist. Create it first." }, { status: 400 });
    }

    // Create a temporary extraction folder within nnUNet_raw.
    const tempDir = path.join(baseDir, "tempUpload", `temp_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const tempZipPath = path.join(tempDir, "upload.zip");
    await fs.writeFile(tempZipPath, buffer);

    // Extract the ZIP contents into the temporary folder.
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(tempDir, true);
    await fs.unlink(tempZipPath);

    // Determine the source for training images.
    const potentialImagesTr = path.join(tempDir, "imagesTr");
    const imagesTrSource = (await exists(potentialImagesTr)) ? potentialImagesTr : tempDir;

    // Destination: the imagesTr folder in the target dataset.
    const destImagesTr = path.join(datasetDir, "imagesTr");
    const filesInSource = await fs.readdir(imagesTrSource);
    const copiedFiles: string[] = [];

    for (const f of filesInSource) {
      const srcPath = path.join(imagesTrSource, f);
      const destPath = path.join(destImagesTr, f);
      const stats = await fs.stat(srcPath);
      if (stats.isFile()) {
        await fs.copyFile(srcPath, destPath);
        copiedFiles.push(f);
      }
    }

    // Update the dataset.json file in the dataset folder.
    await updateDatasetJson(datasetDir, copiedFiles);

    // Clean up the temporary folder.
    await fs.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json({
      message: "ZIP uploaded, training images extracted, and dataset.json updated.",
      dataset: datasetName,
      files: copiedFiles,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json({ error: "Failed to process ZIP file" }, { status: 500 });
  }
}
