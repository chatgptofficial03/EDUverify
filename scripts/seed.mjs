import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting EduVerify Seed Process ---');

  // 1. Clean existing records in correct foreign key order
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.importRow.deleteMany({});
  await prisma.dataImportBatch.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institution.deleteMany({});

  console.log('Cleared existing records.');

  // 2. Create Institutions
  const institutionsData = [
    {
      officialCode: 'AICTE-1-1001',
      name: 'Delhi Institute of Technology & Science',
      institutionType: 'Engineering & Technology',
      state: 'Delhi',
      district: 'New Delhi',
      address: 'Sector 14, Dwarka, New Delhi 110078',
      approvalStatus: 'APPROVED',
      approvedIntake: 200,
      academicYear: '2025-2026',
    },
    {
      officialCode: 'AICTE-1-1002',
      name: 'Maharashtra Polytechnic & Engineering College',
      institutionType: 'Engineering & Technology',
      state: 'Maharashtra',
      district: 'Pune',
      address: 'Shivajinagar, Pune 411005',
      approvalStatus: 'APPROVED',
      approvedIntake: 150,
      academicYear: '2025-2026',
    },
    {
      officialCode: 'AICTE-1-1003',
      name: 'Karnataka Institute of Technology & AI',
      institutionType: 'Engineering & Technology',
      state: 'Karnataka',
      district: 'Bengaluru',
      address: 'Electronic City Phase 1, Bengaluru 560100',
      approvalStatus: 'APPROVED',
      approvedIntake: 180,
      academicYear: '2025-2026',
    },
    {
      officialCode: 'AICTE-1-1004',
      name: 'Tamil Nadu National College of Engineering',
      institutionType: 'Engineering & Technology',
      state: 'Tamil Nadu',
      district: 'Chennai',
      address: 'Guindy Industrial Estate, Chennai 600032',
      approvalStatus: 'APPROVED',
      approvedIntake: 120,
      academicYear: '2025-2026',
    },
    {
      officialCode: 'AICTE-1-1005',
      name: 'Telangana Apex Institute of Technology',
      institutionType: 'Management & Technical',
      state: 'Telangana',
      district: 'Hyderabad',
      address: 'Gachibowli, Hyderabad 500032',
      approvalStatus: 'PROVISIONAL',
      approvedIntake: 100,
      academicYear: '2025-2026',
    },
  ];

  const institutions = [];
  for (const inst of institutionsData) {
    const created = await prisma.institution.create({ data: inst });
    institutions.push(created);
  }
  console.log(`Created ${institutions.length} institutions.`);

  const primaryInst = institutions[0]; // Delhi Institute

  // 3. Create Demo Users (password: Demo@12345)
  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  const usersData = [
    {
      name: 'Dr. Rajesh Sharma (Institution Admin)',
      email: 'institution@demo.edu',
      passwordHash,
      role: 'INSTITUTION_ADMIN',
      institutionId: primaryInst.id,
    },
    {
      name: 'Smt. Ananya Sen (AICTE Central Officer)',
      email: 'aicte@demo.edu',
      passwordHash,
      role: 'AICTE_ADMIN',
      institutionId: null,
    },
    {
      name: 'Officer Vikramaditya (Authorized Verifier)',
      email: 'verifier@demo.edu',
      passwordHash,
      role: 'VERIFIER',
      institutionId: null,
    },
    {
      name: 'Dr. Priya Nair (Observer / State Council)',
      email: 'observer@demo.edu',
      passwordHash,
      role: 'OBSERVER',
      institutionId: null,
    },
  ];

  const users = {};
  for (const u of usersData) {
    const created = await prisma.user.create({ data: u });
    users[u.email] = created;
  }
  console.log('Created demo users.');

  // 4. Seed Synthetic Students (110 total across institutions)
  const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Reyansh', 'Arjun', 'Ananya', 'Diya', 'Isha', 'Aadhya', 'Kavya', 'Rohan', 'Sneha', 'Tanvi', 'Rahul', 'Nikhil', 'Pooja', 'Karan', 'Meera', 'Tarun'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Deshmukh', 'Kulkarni', 'Gupta', 'Singh', 'Choudhury', 'Banerjee', 'Mishra', 'Joshi', 'Bhat', 'Menon', 'Mehta', 'Kaur', 'Das'];
  const programmes = [
    'B.Tech Computer Science & Engineering',
    'B.Tech Electronics & Communication',
    'B.Tech Mechanical Engineering',
    'M.Tech AI & Data Science',
    'MBA Tech Management',
  ];
  const seatCategories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Management', 'TFW'];

  let studentCount = 0;
  const createdStudents = [];

  // Seed 75 students for Primary Institution (Delhi Institute, Approved intake 200 -> 37.5% util)
  for (let i = 1; i <= 75; i++) {
    const fn = firstNames[(i * 3) % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    const prog = programmes[i % programmes.length];
    const cat = seatCategories[i % seatCategories.length];
    const apaar = `9000${String(10000000 + i).slice(-8)}`; // 12-digit format e.g. 900010000001
    const roll = `DIT-2025-CS-${String(100 + i)}`;

    const s = await prisma.student.create({
      data: {
        institutionId: primaryInst.id,
        studentRecordNumber: roll,
        apaarId: apaar,
        fullName: `${fn} ${ln}`,
        dateOfBirth: `2004-0${(i % 9) + 1}-15`,
        programme: prog,
        course: prog.startsWith('M.Tech') || prog.startsWith('MBA') ? 'Postgraduate' : 'Undergraduate',
        academicYear: '2025-2026',
        admissionDate: '2025-08-01',
        enrolmentStatus: i % 18 === 0 ? 'PROVISIONAL' : i % 25 === 0 ? 'COMPLETED' : 'ACTIVE',
        seatCategory: cat,
        nriStatus: i % 20 === 0,
        ociStatus: false,
        foreignNationalStatus: false,
      },
    });
    createdStudents.push(s);
    studentCount++;
  }

  // Seed 20 students for Maharashtra Polytechnic
  for (let i = 1; i <= 20; i++) {
    const fn = firstNames[(i * 2) % firstNames.length];
    const ln = lastNames[(i * 5) % lastNames.length];
    const prog = programmes[i % programmes.length];
    const apaar = `9001${String(20000000 + i).slice(-8)}`;
    const roll = `MPE-2025-${String(200 + i)}`;

    await prisma.student.create({
      data: {
        institutionId: institutions[1].id,
        studentRecordNumber: roll,
        apaarId: apaar,
        fullName: `${fn} ${ln}`,
        dateOfBirth: `2003-11-20`,
        programme: prog,
        course: 'Undergraduate',
        academicYear: '2025-2026',
        admissionDate: '2025-08-10',
        enrolmentStatus: 'ACTIVE',
        seatCategory: 'General',
      },
    });
    studentCount++;
  }

  // Seed 15 students for Karnataka Institute
  for (let i = 1; i <= 15; i++) {
    const fn = firstNames[(i * 4) % firstNames.length];
    const ln = lastNames[(i * 6) % lastNames.length];
    const prog = programmes[i % programmes.length];
    const apaar = `9002${String(30000000 + i).slice(-8)}`;
    const roll = `KIT-2025-${String(300 + i)}`;

    await prisma.student.create({
      data: {
        institutionId: institutions[2].id,
        studentRecordNumber: roll,
        apaarId: apaar,
        fullName: `${fn} ${ln}`,
        dateOfBirth: `2004-03-25`,
        programme: prog,
        course: 'Undergraduate',
        academicYear: '2025-2026',
        admissionDate: '2025-08-12',
        enrolmentStatus: 'ACTIVE',
        seatCategory: 'OBC',
      },
    });
    studentCount++;
  }

  console.log(`Seeded ${studentCount} synthetic student records across institutions.`);

  // 5. Seed Demonstration Batches
  // Batch 1: Approved batch for Primary Institution
  const batch1 = await prisma.dataImportBatch.create({
    data: {
      institutionId: primaryInst.id,
      uploadedBy: users['institution@demo.edu'].id,
      filename: 'delhi_tech_enrolments_phase1.csv',
      totalRows: 50,
      validRows: 50,
      invalidRows: 0,
      duplicateRows: 0,
      status: 'APPROVED',
      reviewComment: 'Verified against AICTE approved seat matrix. Approved for official registry.',
      reviewedBy: users['aicte@demo.edu'].id,
      reviewedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
  });

  // Batch 2: Submitted batch for Maharashtra Institution (pending review)
  const batch2 = await prisma.dataImportBatch.create({
    data: {
      institutionId: institutions[1].id,
      uploadedBy: users['institution@demo.edu'].id,
      filename: 'maharashtra_polytechnic_intake2025.csv',
      totalRows: 20,
      validRows: 20,
      invalidRows: 0,
      duplicateRows: 0,
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  });

  // Batch 3: Rejected batch for Karnataka Institution
  const batch3 = await prisma.dataImportBatch.create({
    data: {
      institutionId: institutions[2].id,
      uploadedBy: users['institution@demo.edu'].id,
      filename: 'karnataka_batch_quota_issues.csv',
      totalRows: 25,
      validRows: 20,
      invalidRows: 5,
      duplicateRows: 2,
      status: 'REJECTED',
      reviewComment: 'Batch rejected due to duplicate APAAR collisions and exceeding allocated OBC category quota.',
      reviewedBy: users['aicte@demo.edu'].id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      submittedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
  });

  // Seed sample rows for Batch 3 to inspect
  await prisma.importRow.create({
    data: {
      batchId: batch3.id,
      rowNumber: 1,
      rawDataJson: JSON.stringify({
        studentRecordNumber: 'KIT-2025-991',
        apaarId: '900010000001', // Collides with student in Delhi Inst!
        fullName: 'Sameer Sen',
        programme: 'B.Tech Computer Science & Engineering',
        academicYear: '2025-2026',
        admissionDate: '2025-08-01',
      }),
      parsedDataJson: null,
      validationStatus: 'INVALID',
      validationErrors: JSON.stringify([
        {
          code: 'DUPLICATE_APAAR_EXISTING',
          message: 'APAAR ID already registered in Delhi Institute of Technology & Science',
          field: 'apaarId',
          severity: 'ERROR',
        },
      ]),
    },
  });

  await prisma.importRow.create({
    data: {
      batchId: batch3.id,
      rowNumber: 2,
      rawDataJson: JSON.stringify({
        studentRecordNumber: 'KIT-2025-992',
        apaarId: 'INVALID_APAAR_123',
        fullName: 'Priya Joshi',
        programme: 'B.Tech Mechanical Engineering',
        academicYear: '2025-2026',
        admissionDate: '2025-13-45', // invalid date
      }),
      parsedDataJson: null,
      validationStatus: 'INVALID',
      validationErrors: JSON.stringify([
        {
          code: 'INVALID_APAAR_FORMAT',
          message: 'Invalid APAAR ID format. Must be 12 numeric digits.',
          field: 'apaarId',
          severity: 'ERROR',
        },
        {
          code: 'INVALID_DATE',
          message: 'Invalid admission date format. Must be YYYY-MM-DD.',
          field: 'admissionDate',
          severity: 'ERROR',
        },
      ]),
    },
  });

  console.log('Seeded demonstration batches and inspection rows.');

  // 6. Seed Verification Requests
  const sampleStudent = createdStudents[0];
  await prisma.verificationRequest.create({
    data: {
      studentId: sampleStudent.id,
      requestedBy: 'National Scholarship Portal (NSP)',
      purpose: 'Central Merit Scholarship Scheme Verification',
      status: 'APPROVED',
      decisionComment: 'Enrolment and approved intake confirmed with AICTE central registry.',
      verificationReference: 'VER-2026-00192',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      decidedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  });

  const sampleStudent2 = createdStudents[1];
  await prisma.verificationRequest.create({
    data: {
      studentId: sampleStudent2.id,
      requestedBy: 'TechCorp Industry Campus Hiring',
      purpose: 'Degree and Enrolment Background Clearance',
      status: 'PENDING',
      verificationReference: 'VER-2026-00451',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
  });

  console.log('Seeded sample verification requests.');

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: users['institution@demo.edu'].id,
        title: 'Batch Approved by AICTE',
        message: 'Your enrolment batch "delhi_tech_enrolments_phase1.csv" has been approved.',
        category: 'REVIEW',
        isRead: false,
      },
      {
        userId: users['institution@demo.edu'].id,
        title: 'Academic Year 2025-26 Enrolment Open',
        message: 'Reminder: Complete all APAAR-linked enrolments prior to the intake audit cutoff.',
        category: 'SYSTEM',
        isRead: true,
      },
      {
        userId: users['aicte@demo.edu'].id,
        title: 'New Batch Submitted for Review',
        message: 'Maharashtra Polytechnic submitted batch "maharashtra_polytechnic_intake2025.csv" (20 records).',
        category: 'SUBMISSION',
        isRead: false,
      },
    ],
  });

  // 8. Seed Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: users['aicte@demo.edu'].id,
        actorEmail: 'aicte@demo.edu',
        actorRole: 'AICTE_ADMIN',
        action: 'BATCH_APPROVE',
        entityType: 'BATCH',
        entityId: batch1.id,
        institutionId: primaryInst.id,
        metadataJson: JSON.stringify({ batchFilename: batch1.filename, approvedRows: 50 }),
      },
      {
        actorUserId: users['institution@demo.edu'].id,
        actorEmail: 'institution@demo.edu',
        actorRole: 'INSTITUTION_ADMIN',
        action: 'BATCH_UPLOAD',
        entityType: 'BATCH',
        entityId: batch1.id,
        institutionId: primaryInst.id,
        metadataJson: JSON.stringify({ filename: batch1.filename, totalRows: 50 }),
      },
      {
        actorUserId: users['verifier@demo.edu'].id,
        actorEmail: 'verifier@demo.edu',
        actorRole: 'VERIFIER',
        action: 'VERIFICATION_QUERY',
        entityType: 'STUDENT',
        entityId: sampleStudent.id,
        metadataJson: JSON.stringify({ reference: 'VER-2026-00192', queriedIdentifier: sampleStudent.studentRecordNumber }),
      },
    ],
  });

  console.log('--- EduVerify Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
