import { Template } from "@shared/schema";
import { class5Semester1Templates } from "./class5-semester1";
import { class5Semester2Templates } from "./class5-semester2";
import { class6Semester1Templates } from "./class6-semester1";
import { class6Semester2Templates } from "./class6-semester2";
import { class7Semester1Templates } from "./class7-semester1";
import { class7Semester2Templates } from "./class7-semester2";
import { class8Semester1Templates } from "./class8-semester1";
import { class8Semester2Templates } from "./class8-semester2";

export function getTemplatesForClassAndSemester(classNum: string, semester: string): Template[] {
  const key = `${classNum}-${semester}`;
  
  const templateMap: Record<string, Template[]> = {
    "5-1": class5Semester1Templates,
    "5-2": class5Semester2Templates,
    "6-1": class6Semester1Templates,
    "6-2": class6Semester2Templates,
    "7-1": class7Semester1Templates,
    "7-2": class7Semester2Templates,
    "8-1": class8Semester1Templates,
    "8-2": class8Semester2Templates,
  };
  
  return templateMap[key] || [];
}

export function replaceNamePlaceholder(template: Template, studentName: string): Template {
  const firstName = studentName.split(" ")[0];
  return {
    ...template,
    text: template.text.replace(/{name}/g, firstName)
  };
}

export * from "./class5-semester1";
export * from "./class5-semester2";
export * from "./class6-semester1";
export * from "./class6-semester2";
export * from "./class7-semester1";
export * from "./class7-semester2";
export * from "./class8-semester1";
export * from "./class8-semester2";