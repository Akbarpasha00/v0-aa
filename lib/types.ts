export interface Student {
  // Mandatory fields
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  btechPercentage: number;
  status: string;

  // Optional fields
  mobile?: string;
  gender?: string;
  assignedTPO?: string;
  yearOfPassout?: string;
  graduationPercentage?: number;
  collegeName?: string;
  interDiplomaPercentage?: number;
  previousCollegeName?: string;
  sscPercentage?: number;
  schoolName?: string;
  panCardNo?: string;
  aadharCardNo?: string;
}
