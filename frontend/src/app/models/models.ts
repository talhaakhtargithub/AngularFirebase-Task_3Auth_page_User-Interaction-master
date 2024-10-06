export interface Course {
  code: string;
  title: string;
}

export interface Student {
  index: number;
  name: string;
  id: string;
  semester: string;
  attendance: number;
  details: string; // Additional details for the modal
}
