import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { Student } from '@/lib/types';

// Helper function to normalize header names
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, ''); // Keep only alphanumeric
};

// Mapping from normalized Excel headers to Student interface keys
// Ensure this map covers all expected header variations and maps to correct Student interface keys
const headerToKeyMap: { [key: string]: keyof Student } = {
  name: 'name',
  studentname: 'name',
  fullname: 'name',
  email: 'email',
  emailaddress: 'email',
  rollno: 'rollNo',
  rollnumber: 'rollNo',
  branch: 'branch',
  department: 'branch',
  btechpercentage: 'btechPercentage',
  btechcgpa: 'btechPercentage', // Assuming CGPA might be used interchangeably for percentage
  btechmarks: 'btechPercentage',
  status: 'status',
  placementstatus: 'status',
  mobile: 'mobile',
  phonenumber: 'mobile',
  contactno: 'mobile',
  gender: 'gender',
  assignedtpo: 'assignedTPO',
  tpoassigned: 'assignedTPO',
  yearofpassout: 'yearOfPassout',
  passingyear: 'yearOfPassout',
  graduationpercentage: 'graduationPercentage',
  graduationmarks: 'graduationPercentage',
  graduationcgpa: 'graduationPercentage',
  collegename: 'collegeName',
  institutionname: 'collegeName',
  interdiplomapercentage: 'interDiplomaPercentage',
  interpercentage: 'interDiplomaPercentage',
  diplomapercentage: 'interDiplomaPercentage',
  intermarks: 'interDiplomaPercentage',
  previouscollegename: 'previousCollegeName',
  intercollegename: 'previousCollegeName',
  diplomacollegename: 'previousCollegeName',
  sscpercentage: 'sscPercentage',
  tenthpercentage: 'sscPercentage',
  sscmarks: 'sscPercentage',
  schoolname: 'schoolName',
  sscschoolname: 'schoolName',
  pancardno: 'panCardNo',
  pan: 'panCardNo',
  aadharcardno: 'aadharCardNo',
  aadhar: 'aadharCardNo',
};

const mandatoryFields: (keyof Student)[] = ['name', 'email', 'rollNo', 'branch', 'btechPercentage', 'status'];
const numericFields: (keyof Student)[] = ['btechPercentage', 'graduationPercentage', 'interDiplomaPercentage', 'sscPercentage'];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  // Check file type
  const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    return NextResponse.json({ error: 'Invalid file type. Only .xlsx or .xls are allowed.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: 'array', cellDates: true }); // cellDates: true for date parsing if needed
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][]; // defval: null for empty cells

    if (jsonData.length < 2) { // At least one header row and one data row
      return NextResponse.json({ error: 'Excel file is empty or has no data rows.' }, { status: 400 });
    }

    const rawHeaders = jsonData[0];
    const normalizedHeaders = rawHeaders.map(header => normalizeHeader(String(header)));
    const validatedStudentsArray: Student[] = [];
    const errors: { row: number; field?: string; message: string }[] = [];


    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      // Skip empty rows (e.g. if all cells in a row are null or empty strings)
      if (row.every(cell => cell === null || String(cell).trim() === '')) {
        continue;
      }
      
      const studentData: Partial<Student> = {};
      let hasErrorInRow = false;

      for (let j = 0; j < normalizedHeaders.length; j++) {
        const headerKey = headerToKeyMap[normalizedHeaders[j]];
        if (headerKey) {
          let value = row[j];
          if (value !== null && String(value).trim() !== '') {
            if (numericFields.includes(headerKey)) {
              const numValue = parseFloat(String(value));
              if (!isNaN(numValue)) {
                (studentData as any)[headerKey] = numValue;
              } else {
                // If a numeric field cannot be parsed, and it's not mandatory, we can choose to ignore or set to undefined.
                // If it IS mandatory (e.g. btechPercentage), the mandatory check below will catch it if it becomes undefined.
                 if (mandatoryFields.includes(headerKey)) {
                    errors.push({ row: i + 1, field: rawHeaders[j] || `Column ${j+1}`, message: `${rawHeaders[j]} must be a number.` });
                    hasErrorInRow = true;
                 } else {
                    (studentData as any)[headerKey] = undefined; // Or simply don't set it
                 }
              }
            } else {
              (studentData as any)[headerKey] = String(value).trim();
            }
          }
        }
      }

      // Validate mandatory fields
      for (const field of mandatoryFields) {
        if (studentData[field] === undefined || studentData[field] === null || String(studentData[field]).trim() === '') {
          errors.push({ row: i + 1, field: field, message: `Missing or empty mandatory field: ${field}` });
          hasErrorInRow = true;
        }
      }
      
      // Special check for btechPercentage to ensure it was successfully parsed as a number if initially present
      if (mandatoryFields.includes('btechPercentage') && typeof studentData.btechPercentage !== 'number') {
          // This error is now more specifically handled during parsing if the value was not a number.
          // However, if the column was missing entirely, the above mandatory check handles it.
          // This specific check ensures if the column *was* there but bad, it's caught.
          // To avoid duplicate errors, ensure the parsing logic sets it to undefined if not parsable,
          // then the mandatory check will flag it.
          // The current logic already pushes an error if a mandatory numeric field is not a number.
      }


      if (!hasErrorInRow) {
        validatedStudentsArray.push(studentData as Student);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ message: "Validation failed. See errors.", errors }, { status: 400 });
    }

    // In a real scenario, here you would save validatedStudentsArray to the database.
    // For now, we just return the validated data.
    return NextResponse.json(
      { message: `Successfully uploaded and validated ${validatedStudentsArray.length} students.`, data: validatedStudentsArray },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing file:", error);
    // Basic error check, can be more specific (e.g. if (error instanceof SpecificErrorType))
    const errorMessage = error instanceof Error ? error.message : 'Failed to process Excel file.';
    return NextResponse.json({ error: 'Failed to process Excel file.', details: errorMessage }, { status: 500 });
  }
}
