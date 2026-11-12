import type { Project } from "./models";

export interface ProjectWithTaskCount extends Project {
  taskCount: number;
}
