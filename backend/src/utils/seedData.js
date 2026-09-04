const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const University = require('../models/University');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Industry = require('../models/Industry');
const Partnership = require('../models/Partnership');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing seed collections
    await User.deleteMany({ email: { $in: [
      'citizen@delhi.gov.in',
      'admin@delhi.gov.in',
      'university@dtu.ac.in',
      'faculty@dtu.ac.in',
      'student@nsut.ac.in',
      'industry@tatapower.com'
    ] } });
    await Challenge.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    await University.deleteMany({});
    await Faculty.deleteMany({});
    await Student.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Industry.deleteMany({});
    await Partnership.deleteMany({});

    console.log('[Seed] Creating demo users for all 6 stakeholder roles...');

    const citizen = await User.create({
      name: 'Sunita Sharma (RWA President)',
      email: 'citizen@delhi.gov.in',
      password: 'Password123',
      role: 'CLIENT',
      organization: 'Resident Welfare Association, Mayur Vihar',
      phone: '+91 98111 22334',
      district: 'East Delhi',
      isActive: true,
      approvalStatus: 'APPROVED'
    });

    const admin = await User.create({
      name: 'Dr. Vivek Saxena (IAS)',
      email: 'admin@delhi.gov.in',
      password: 'Password123',
      role: 'ADMIN',
      organization: 'Delhi State Innovation Council, GNCTD',
      phone: '+91 011-23379000',
      district: 'Central Delhi',
      isActive: true,
      approvalStatus: 'APPROVED'
    });

    const university = await User.create({
      name: 'Delhi Technological University (DTU)',
      email: 'university@dtu.ac.in',
      password: 'Password123',
      role: 'UNIVERSITY',
      organization: 'Office of Dean (Research & Innovation), DTU',
      phone: '+91 011-27871018',
      district: 'North West Delhi',
      isActive: true,
      approvalStatus: 'APPROVED'
    });

    await University.create({
      user: university._id,
      name: 'Delhi Technological University (DTU)',
      campus: 'Shahbad Daulatpur, Bawana Road, Delhi 110042',
      district: 'North West Delhi',
      departments: [
        'Department of Environmental Engineering',
        'Department of Computer Science & Engineering',
        'Department of Electrical Engineering',
        'Department of Civil Engineering',
        'Department of Biotechnology'
      ],
      researchAreas: [
        'Municipal IoT Telemetry & Heavy Metal Sensing',
        'Biomethanation & Urban Solid Waste Digestion',
        'Micro-Grid Solar Power Harvesting & Storage',
        'Smart Mobility & Transit Signal Automation'
      ],
      expertise: [
        'Environmental Engineering',
        'IoT',
        'Water Management',
        'Renewable Energy',
        'AI/ML',
        'Urban Planning'
      ],
      labsAndFacilities: [
        'Centre for Environmental Biotechnology & Biogas Pilot Facility',
        'Smart Grid & Autonomous Sensor Network Laboratory',
        'Solar Photovoltaic High-Efficiency Testing Station',
        'Rapid Prototyping Workshop & Fabrication Lab'
      ],
      innovationCentre: 'DTU Innovation and Incubation Foundation (DTU-IIF)',
      incubationFacilities: 'Technology Business Incubator (TBI) & Prototype Cell (DST Supported)',
      facultySpecializations: [
        {
          facultyName: 'Prof. S. K. Sharma',
          department: 'Environmental Engineering',
          specialization: 'Biomethanation & Anaerobic Waste Digestion',
          email: 'sksharma@dtu.ac.in'
        },
        {
          facultyName: 'Dr. Radhika Sen',
          department: 'Computer Science & Engineering',
          specialization: 'Sensor Telemetry & IoT Machine Learning',
          email: 'radhika.sen@dtu.ac.in'
        },
        {
          facultyName: 'Prof. Alok Gupta',
          department: 'Electrical Engineering',
          specialization: 'Solar Microgrids & LED Power Conditioning',
          email: 'alok.gupta@dtu.ac.in'
        }
      ],
      studentTeamsCount: 16,
      facultyMentorsCount: 9
    });

    const faculty = await User.create({
      name: 'Prof. S. K. Sharma (Faculty Mentor)',
      email: 'faculty@dtu.ac.in',
      password: 'Password123',
      role: 'FACULTY',
      organization: 'Department of Environmental Engineering, DTU',
      phone: '+91 98101 44556',
      district: 'North West Delhi',
      isActive: true,
      approvalStatus: 'APPROVED'
    });

    const student = await User.create({
      name: 'Aarav Malhotra (Student Team Lead)',
      email: 'student@nsut.ac.in',
      password: 'Password123',
      role: 'STUDENT',
      organization: 'NSUT Society of Robotics & Innovation',
      phone: '+91 99222 33445',
      district: 'South West Delhi',
      isActive: true,
      approvalStatus: 'APPROVED'
    });

    const industry = await User.create({
      name: 'Tata Power Delhi Innovation Hub',
      email: 'industry@tatapower.com',
      password: 'Password123',
      role: 'INDUSTRY',
      organization: 'Tata Power DDL Smart Grid Lab',
      phone: '+91 011-66112233',
      district: 'North West Delhi',
      isActive: true,
      approvalStatus: 'APPROVED'
    });

    console.log('[Seed] Seeding realistic Delhi challenges with urgency, severity, and impact...');

    const c1 = await Challenge.create({
      code: 'DEL-201',
      title: 'Decentralized Wet Waste Biomethanation at Ghazipur Mandi Outskirts',
      description: 'Over 80 tonnes of vegetable and fruit refuse generates leachate and severe odor impacting adjacent residential pockets daily. Requires localized rapid digesting bioreactors to generate clean fuel for municipal vehicles.',
      category: 'Sanitation',
      district: 'East Delhi',
      location: {
        area: 'Ghazipur Wholesale Fruit & Vegetable Market',
        landmark: 'Opposite Ghazipur DDA Colony Gate 2',
        coordinates: { lat: 28.6256, lng: 77.3298 }
      },
      submittedBy: citizen._id,
      status: 'ASSIGNED',
      priority: 'critical',
      urgency: 'immediate',
      severity: 'critical',
      impact: 'Estimated 25,000+ local residents and wholesale market workers directly exposed to bio-leachate',
      assignedUniversity: university._id,
      facultyLead: { name: 'Prof. S. K. Sharma', department: 'Environmental Engineering' },
      assignedStudents: [student._id],
      industryPartner: industry._id,
      sponsoredAmount: 1500000,
      internalNotes: [
        {
          note: 'DPCC inspection confirmed odor threshold exceeds limits. DTU biogas lab assigned Principal Investigator role.',
          author: admin._id,
          authorName: 'Dr. Vivek Saxena (IAS)',
          createdAt: new Date(Date.now() - 14 * 86400000)
        }
      ],
      timeline: [
        { status: 'SUBMITTED', label: 'Challenge Submitted by RWA', date: new Date(Date.now() - 25 * 86400000), comment: 'Report lodged with geotagged measurements' },
        { status: 'UNDER_REVIEW', label: 'Under Review by Nodal Officer', date: new Date(Date.now() - 22 * 86400000), comment: 'Screened by East Delhi District Innovation Cell' },
        { status: 'VALIDATED', label: 'Validated by Delhi State Innovation Council', date: new Date(Date.now() - 18 * 86400000), comment: 'Vetted as critical priority environmental statement' },
        { status: 'ASSIGNED', label: 'Assigned to DTU Research Lab', date: new Date(Date.now() - 14 * 86400000), comment: 'Prof. S. K. Sharma designated as Faculty Mentor' }
      ],
      evidence: [
        { title: 'Ground Odor Survey Report (PPM Log)', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600', fileType: 'image/jpeg' },
        { title: 'Site Drainage Photographs', url: 'https://images.unsplash.com/photo-1611288870280-4a34b22591e0?auto=format&fit=crop&w=600', fileType: 'image/jpeg' }
      ],
      tags: ['waste-to-energy', 'biogas', 'sanitation'],
      aiClassification: {
        category: 'Sanitation',
        subcategory: 'biomethanation',
        confidence: 0.92,
        requiresHumanReview: false,
        explanation: 'Matched solid waste refuse, leachate, and biomethanation domain vectors.'
      },
      aiPriority: {
        recommendedPriority: 'CRITICAL',
        confidence: 0.88,
        reasoning: 'Bio-leachate odor threshold exceeded; 25,000+ residents and mandi workers exposed.'
      },
      aiDuplicateScore: 0.15,
      aiDuplicates: [],
      aiSummary: {
        problem: 'Over 80 tonnes of vegetable refuse generating toxic leachate and severe odor daily.',
        affectedGroup: '25,000+ local residents and wholesale market workers',
        location: 'Ghazipur Wholesale Fruit & Vegetable Market, East Delhi',
        expectedOutcome: 'Decentralized high-rate biomethanation reactor producing clean vehicle fuel.'
      }
    });

    const c2 = await Challenge.create({
      code: 'DEL-202',
      title: 'Autonomous Heavy Metal Sensor Grid along Najafgarh Industrial Confluence',
      description: 'Periodic untraced industrial effluent discharges into the Najafgarh basin pose severe contamination hazards to local groundwater tables. Demanding autonomous spectrophotometer nodes with cellular telemetry.',
      category: 'Water Management',
      district: 'South West Delhi',
      location: {
        area: 'Najafgarh Drain Industrial Confluence',
        landmark: 'Near Kakrola Regulator Bridge',
        coordinates: { lat: 28.6133, lng: 76.9856 }
      },
      submittedBy: citizen._id,
      status: 'VALIDATED',
      priority: 'high',
      urgency: 'high',
      severity: 'severe',
      impact: 'Groundwater table contamination affecting approximately 40,000 residents across Najafgarh and Dwarka',
      internalNotes: [
        {
          note: 'DPCC inspection records matched with citizen observations. Ready for academic allocation.',
          author: admin._id,
          authorName: 'Dr. Vivek Saxena (IAS)',
          createdAt: new Date(Date.now() - 2 * 86400000)
        }
      ],
      timeline: [
        { status: 'SUBMITTED', label: 'Report Lodged by Citizen', date: new Date(Date.now() - 15 * 86400000), comment: 'Water test samples attached by community volunteers' },
        { status: 'UNDER_REVIEW', label: 'Technical Screening', date: new Date(Date.now() - 10 * 86400000), comment: 'Field verification confirmed effluent presence' },
        { status: 'VALIDATED', label: 'Validated by State Authority', date: new Date(Date.now() - 2 * 86400000), comment: 'Approved for University Academic Assignment' }
      ],
      evidence: [
        { title: 'Laboratory TDS & Chromium Test Report', url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600', fileType: 'image/jpeg' }
      ],
      tags: ['water-quality', 'iot-telemetry', 'pollution-control'],
      aiClassification: {
        category: 'Water Management',
        subcategory: 'drain_treatment',
        confidence: 0.89,
        requiresHumanReview: false,
        explanation: 'Matched industrial effluent, groundwater contamination, and telemetry keywords.'
      },
      aiPriority: {
        recommendedPriority: 'HIGH',
        confidence: 0.85,
        reasoning: 'Severe toxic effluent discharge impacting 40,000 residents across Najafgarh basin.'
      },
      aiDuplicateScore: 0.22,
      aiDuplicates: [],
      aiSummary: {
        problem: 'Periodic untraced industrial effluent discharges into the Najafgarh basin.',
        affectedGroup: '40,000+ residents dependent on local groundwater aquifers',
        location: 'Near Kakrola Regulator Bridge, South West Delhi',
        expectedOutcome: 'Autonomous spectrophotometer sensor grid with cellular telemetry.'
      }
    });

    const c3 = await Challenge.create({
      code: 'DEL-203',
      title: 'Micro-Climatic Electrostatic PM2.5 Filtration at Anand Vihar Transit Hub',
      description: 'Anand Vihar terminal experiences peak winter particulate levels due to inter-state bus movements and highway dust. Requesting deployable low-power electrostatic air precipitation towers.',
      category: 'Environment',
      district: 'East Delhi',
      location: {
        area: 'Anand Vihar ISBT & Metro Interchange',
        landmark: 'Choudhary Charan Singh Marg Departure Terminal',
        coordinates: { lat: 28.6475, lng: 77.3160 }
      },
      submittedBy: citizen._id,
      status: 'SUBMITTED',
      priority: 'high',
      urgency: 'high',
      severity: 'severe',
      impact: 'Over 80,000 daily interstate bus passengers and transit commuters exposed to particulate peaks',
      timeline: [
        { status: 'SUBMITTED', label: 'Citizen Submission Lodged', date: new Date(Date.now() - 1 * 86400000), comment: 'Submitted by Sunita Sharma (RWA President). Awaiting initial nodal review.' }
      ],
      evidence: [
        { title: 'Transit Terminal Air Reading Sensor Log', url: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?auto=format&fit=crop&w=600', fileType: 'image/jpeg' }
      ],
      tags: ['air-quality', 'transport-hub', 'public-health'],
      aiClassification: {
        category: 'Environment',
        subcategory: 'air_pollution_pm25',
        confidence: 0.94,
        requiresHumanReview: false,
        explanation: 'Matched PM2.5, particulate emissions, air filtration, and transit hub keywords.'
      },
      aiPriority: {
        recommendedPriority: 'HIGH',
        confidence: 0.86,
        reasoning: 'High particulate exposure affecting 80,000 daily transit passengers.'
      },
      aiDuplicateScore: 0.18,
      aiDuplicates: [],
      aiSummary: {
        problem: 'Anand Vihar terminal experiences peak winter particulate levels due to interstate bus movements.',
        affectedGroup: '80,000+ daily interstate bus passengers and transit commuters',
        location: 'Anand Vihar ISBT & Metro Interchange, East Delhi',
        expectedOutcome: 'Deployable low-power electrostatic air precipitation towers.'
      }
    });

    const c4 = await Challenge.create({
      code: 'DEL-204',
      title: 'Vandal-Resistant Solar LED Lighting for Ring Road Pedestrian Subways',
      description: 'Pedestrian underpasses across South Delhi suffer frequent blackout periods impacting nighttime safety, especially for female pedestrians and senior citizens. Requires vandal-resistant self-sustaining solar illumination.',
      category: 'Urban Infrastructure',
      district: 'South Delhi',
      location: {
        area: 'AIIMS - Safdarjung Pedestrian Subway',
        landmark: 'Ring Road Crossing, Ansari Nagar',
        coordinates: { lat: 28.5672, lng: 77.2100 }
      },
      submittedBy: citizen._id,
      status: 'RESOLVED',
      priority: 'medium',
      urgency: 'medium',
      severity: 'moderate',
      impact: 'Provides secure nighttime transit for 12,000+ hospital visitors, medical staff, and metro commuters daily',
      assignedUniversity: university._id,
      industryPartner: industry._id,
      sponsoredAmount: 600000,
      timeline: [
        { status: 'SUBMITTED', label: 'Issue Submitted', date: new Date(Date.now() - 60 * 86400000), comment: 'Reported by local resident coalition' },
        { status: 'VALIDATED', label: 'Validated by Council', date: new Date(Date.now() - 50 * 86400000), comment: 'Site inspection confirmed lighting deficits' },
        { status: 'ASSIGNED', label: 'Assigned to DTU Solar Lab', date: new Date(Date.now() - 40 * 86400000), comment: 'Student engineers created motion-sensing solar array' },
        { status: 'RESOLVED', label: 'Permanent Handover to Delhi PWD', date: new Date(Date.now() - 5 * 86400000), comment: 'Solution officially certified and operational' }
      ],
      evidence: [
        { title: 'Subway Pre-Installation Dark Spots Map', url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600', fileType: 'image/jpeg' },
        { title: 'Completed Solar Installation Photo', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600', fileType: 'image/jpeg' }
      ],
      tags: ['solar-lighting', 'women-safety', 'infrastructure'],
      aiClassification: {
        category: 'Urban Infrastructure',
        subcategory: 'pedestrian_subways',
        confidence: 0.91,
        requiresHumanReview: false,
        explanation: 'Matched pedestrian subway, blackout, street illumination, and safety indicators.'
      },
      aiPriority: {
        recommendedPriority: 'MEDIUM',
        confidence: 0.78,
        reasoning: 'Nighttime transit safety and dark spot elimination for hospital visitors.'
      },
      aiDuplicateScore: 0.12,
      aiDuplicates: [],
      aiSummary: {
        problem: 'Frequent blackout periods in pedestrian underpass impacting nighttime commuter safety.',
        affectedGroup: '12,000+ daily hospital visitors, medical personnel, and pedestrians',
        location: 'AIIMS - Safdarjung Pedestrian Subway, Ring Road, South Delhi',
        expectedOutcome: 'Vandal-resistant self-sustaining solar illumination grid.'
      }
    });

    const c5 = await Challenge.create({
      code: 'DEL-205',
      title: 'Tactile Smart Auditory Navigation for Delhi Metro Kashmere Gate Interchange',
      description: 'Visually impaired commuters face acute navigational confusion across three intersecting transit lines at Kashmere Gate. Requesting smart tactile beacon guidance synchronized with Delhi Sarathi mobile app.',
      category: 'Accessibility',
      district: 'North Delhi',
      location: {
        area: 'Kashmere Gate Metro Interchange',
        landmark: 'Inter-line transfer concourse Gate 4',
        coordinates: { lat: 28.6675, lng: 77.2285 }
      },
      submittedBy: citizen._id,
      status: 'NEEDS_INFORMATION',
      priority: 'medium',
      urgency: 'medium',
      severity: 'moderate',
      impact: 'Estimated 2,500 daily differently-abled transit passengers navigating multistory escalators and corridors',
      timeline: [
        { status: 'SUBMITTED', label: 'Report Lodged', date: new Date(Date.now() - 8 * 86400000), comment: 'Auditory navigation proposal submitted' },
        { status: 'UNDER_REVIEW', label: 'DMRC Inter-Agency Coordination', date: new Date(Date.now() - 4 * 86400000), comment: 'Nodal team scheduled technical walkthrough' },
        { status: 'NEEDS_INFORMATION', label: 'Additional Information Requested', date: new Date(Date.now() - 1 * 86400000), comment: 'Please specify existing beacon frequencies supported by Delhi Metro app' }
      ],
      evidence: [
        { title: 'Concourse Accessibility Audit Checklist', url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600', fileType: 'image/jpeg' }
      ],
      tags: ['accessibility', 'metro-transit', 'social-welfare'],
      aiClassification: {
        category: 'Accessibility',
        subcategory: 'auditory_metro_navigation',
        confidence: 0.95,
        requiresHumanReview: false,
        explanation: 'Strong semantic match with tactile paving, auditory guidance, and transit accessibility.'
      },
      aiPriority: {
        recommendedPriority: 'MEDIUM',
        confidence: 0.82,
        reasoning: 'Assists 2,500 daily visually-impaired passengers across major triple-line interchange.'
      },
      aiDuplicateScore: 0.10,
      aiDuplicates: [],
      aiSummary: {
        problem: 'Acute navigational confusion for visually-impaired passengers across three intersecting transit lines.',
        affectedGroup: '2,500 daily differently-abled commuters and visually-impaired passengers',
        location: 'Kashmere Gate Metro Interchange concourse, North Delhi',
        expectedOutcome: 'Smart tactile auditory beacon guidance network integrated with Delhi Sarathi.'
      }
    });

    console.log('[Seed] Seeding sample AuditLog records...');

    await AuditLog.create([
      {
        challenge: c1._id,
        user: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: 'VALIDATE',
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'VALIDATED',
        comment: 'High priority community statement vetted and confirmed.',
        timestamp: new Date(Date.now() - 18 * 86400000)
      },
      {
        challenge: c1._id,
        user: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: 'ASSIGN_UNIVERSITY',
        previousStatus: 'VALIDATED',
        newStatus: 'ASSIGNED',
        comment: 'Allocated to Delhi Technological University (DTU) Environmental Lab.',
        metadata: { universityId: university._id, universityName: university.name },
        timestamp: new Date(Date.now() - 14 * 86400000)
      },
      {
        challenge: c2._id,
        user: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: 'VALIDATE',
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'VALIDATED',
        comment: 'Water quality data corroborated with DPCC monitoring station.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        challenge: c5._id,
        user: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: 'REQUEST_INFORMATION',
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'NEEDS_INFORMATION',
        comment: 'Please specify existing beacon frequencies supported by Delhi Metro app.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ]);

    console.log('[Seed] Seeding citizen notifications...');

    await Notification.create([
      {
        recipient: citizen._id,
        title: 'Challenge Assigned to University Lab',
        message: `Your challenge [${c1.code}] "${c1.title}" has been officially allocated to Delhi Technological University (DTU).`,
        type: 'ASSIGNED',
        challenge: c1._id,
        read: false,
        createdAt: new Date(Date.now() - 14 * 86400000)
      },
      {
        recipient: citizen._id,
        title: 'Challenge Validated by State Authority',
        message: `Your submitted problem [${c2.code}] "${c2.title}" has been approved by the Delhi State Innovation Council.`,
        type: 'VALIDATED',
        challenge: c2._id,
        read: false,
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        recipient: citizen._id,
        title: 'Action Required: Additional Information Requested',
        message: `Nodal officers reviewing [${c5.code}] require additional information: "Please specify existing beacon frequencies supported by Delhi Metro app"`,
        type: 'NEEDS_INFORMATION',
        challenge: c5._id,
        read: false,
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ]);

    console.log('[Seed] Seeding academic faculty mentors...');
    const f1 = await Faculty.create({
      university: university._id,
      user: faculty._id,
      name: 'Prof. S. K. Sharma',
      email: 'faculty@dtu.ac.in',
      department: 'Department of Environmental Engineering',
      specialization: 'Biomethanation & Anaerobic Waste Digestion',
      experience: '16 Years',
      expertise: ['Environmental Engineering', 'Water Management', 'IoT']
    });

    const f2 = await Faculty.create({
      university: university._id,
      name: 'Dr. Radhika Sen',
      email: 'radhika.sen@dtu.ac.in',
      department: 'Department of Computer Science & Engineering',
      specialization: 'Sensor Telemetry & IoT Machine Learning',
      experience: '11 Years',
      expertise: ['AI/ML', 'IoT', 'Computer Vision']
    });

    const f3 = await Faculty.create({
      university: university._id,
      name: 'Prof. Alok Gupta',
      email: 'alok.gupta@dtu.ac.in',
      department: 'Department of Electrical Engineering',
      specialization: 'Solar Microgrids & LED Power Conditioning',
      experience: '14 Years',
      expertise: ['Renewable Energy', 'Urban Planning']
    });

    console.log('[Seed] Seeding student innovator profiles...');
    const s1 = await Student.create({
      university: university._id,
      user: student._id,
      name: 'Aarav Malhotra',
      email: 'student@nsut.ac.in',
      department: 'Computer Science & Engineering',
      year: '3rd Year B.Tech',
      skills: ['Python', 'FastAPI', 'TensorFlow', 'React'],
      expertise: ['AI/ML', 'Backend']
    });

    const s2 = await Student.create({
      university: university._id,
      name: 'Priya Verma',
      email: 'priya.verma@dtu.ac.in',
      department: 'Environmental Engineering',
      year: 'Final Year M.Tech',
      skills: ['Bioreactor Design', 'Spectrometry', 'Leachate Analysis'],
      expertise: ['Environmental Engineering', 'Research']
    });

    const s3 = await Student.create({
      university: university._id,
      name: 'Rohan Saxena',
      email: 'rohan.saxena@dtu.ac.in',
      department: 'Electronics & Communication',
      year: '3rd Year B.Tech',
      skills: ['Embedded C', 'LoRaWAN', 'PCB Fabrication', 'Sensors'],
      expertise: ['Hardware', 'IoT']
    });

    const s4 = await Student.create({
      university: university._id,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@dtu.ac.in',
      department: 'Civil Engineering',
      year: '2nd Year B.Tech',
      skills: ['GIS Mapping', 'AutoCAD', 'Urban Hydrology'],
      expertise: ['Urban Planning', 'Documentation']
    });

    console.log('[Seed] Seeding academic research project & multidisciplinary team...');
    const p1 = await Project.create({
      challengeId: c1._id,
      universityId: university._id,
      title: 'High-Rate Biomethanation Pilot Reactor for Ghazipur Wholesale Mandi',
      description: 'Over 80 tonnes of vegetable and fruit refuse generates leachate and severe odor daily. This project develops a pilot automated biogas reactor.',
      proposedSolution: 'Continuous stirred-tank biomethanation reactor (CSTR) with IoT telemetry for volatile fatty acid and pH monitoring.',
      objectives: [
        'Design automated slurry pre-treatment unit for high-moisture citrus refuse',
        'Deploy LoRaWAN telemetry grid for continuous digester temperature and methane purity logging',
        'Fabricate skid-mounted mobile purification module generating compressed vehicle-grade biogas'
      ],
      technologies: ['Biomethanation', 'IoT Sensors', 'LoRaWAN', 'Scada Telemetry', 'Python ML'],
      timeline: '6 Months (Sep 2026 - Feb 2027)',
      budget: {
        estimatedAmount: 1500000,
        breakdown: 'FabLab mechanical chassis: ₹5.5L; Sensing instrumentation: ₹3.8L; Student stipends: ₹3.2L; Contingency: ₹2.5L'
      },
      teamRequirements: 'Multidisciplinary cohort spanning Environmental, Mechanical, and Embedded IoT engineers.',
      mentor: f1._id,
      status: 'PROTOTYPE',
      overallProgress: 55,
      outcomes: [
        'Reduces leachate runoff by 85% across market boundary',
        'Generates 120 kg/day of compressed natural gas for municipal refuse trucks'
      ],
      proposal: {
        problemUnderstanding: 'Ghazipur wholesale vegetable mandi generates acute organic bio-waste requiring onsite anaerobic stabilization.',
        proposedSolution: 'Continuous decentralized high-rate biomethanation reactor with automated pH dosing.',
        methodology: 'Iterative laboratory seed culture optimization followed by pilot skid commissioning.',
        technology: ['Anaerobic Digestion', 'IoT Sensors', 'LoRaWAN', 'FastAPI'],
        timeline: '6 Months',
        expectedImpact: 'Direct environmental relief for 25,000 residents in East Delhi.',
        submittedAt: new Date(Date.now() - 12 * 86400000),
        reviewedAt: new Date(Date.now() - 10 * 86400000),
        approvalStatus: 'APPROVED'
      },
      milestones: [
        {
          title: 'Substrate Leachate Chemical Characterization',
          description: 'Comprehensive chemical assay of wet mandi leachate and pathogen load.',
          status: 'COMPLETED',
          progress: 100,
          deliverables: ['Certified laboratory lab chemical composition report'],
          completedDate: new Date(Date.now() - 10 * 86400000),
          startDate: new Date(Date.now() - 25 * 86400000),
          dueDate: new Date(Date.now() - 10 * 86400000)
        },
        {
          title: 'CAD Chassis & Stirrer Engineering Schematics',
          description: 'SolidWorks fabrication drawings, motor sizing, and anaerobic sealing specs.',
          status: 'COMPLETED',
          progress: 100,
          deliverables: ['SolidWorks fabrication drawings', 'Motor torque sizing sheet'],
          completedDate: new Date(Date.now() - 3 * 86400000),
          startDate: new Date(Date.now() - 10 * 86400000),
          dueDate: new Date(Date.now() - 2 * 86400000)
        },
        {
          title: 'IoT Telemetry Circuit Benchtop Testing',
          description: 'Benchtop validation of methane purity sensor and LoRaWAN telemetry board.',
          status: 'IN_PROGRESS',
          progress: 40,
          deliverables: ['Sensor PCB prototype with GSM telemetry', 'Telemetry API documentation'],
          startDate: new Date(Date.now() - 5 * 86400000),
          dueDate: new Date(Date.now() + 15 * 86400000)
        },
        {
          title: 'Skid Commissioning at Ghazipur Gate 2',
          description: 'Deployment of pilot skid reactor on-site and continuous 72-hour burn test.',
          status: 'NOT_STARTED',
          progress: 0,
          deliverables: ['Pilot biogas production verification', 'MCD Municipal Handover Note'],
          dueDate: new Date(Date.now() + 60 * 86400000)
        }
      ],
      documents: [
        {
          title: 'Ghazipur_Mandi_Leachate_Lab_Report_V1.pdf',
          url: 'https://storage.placeholder.delhi.gov.in/delhi_project_deliverables/Ghazipur_Leachate_Report.pdf',
          publicId: 'doc_ghazipur_01',
          fileType: 'application/pdf',
          uploadedBy: university._id,
          uploaderName: 'DTU Environmental Lab',
          uploaderRole: 'UNIVERSITY',
          uploadedAt: new Date(Date.now() - 10 * 86400000)
        },
        {
          title: 'Bioreactor_Mechanical_Schematics.pdf',
          url: 'https://storage.placeholder.delhi.gov.in/delhi_project_deliverables/Bioreactor_Schematics.pdf',
          publicId: 'doc_ghazipur_02',
          fileType: 'application/pdf',
          uploadedBy: university._id,
          uploaderName: 'Prof. S. K. Sharma',
          uploaderRole: 'FACULTY',
          uploadedAt: new Date(Date.now() - 3 * 86400000)
        }
      ],
      updates: [
        {
          user: university._id,
          userName: 'Delhi Technological University (DTU)',
          userRole: 'UNIVERSITY',
          title: 'Prototype Fabrication Phase Initiated',
          content: 'Bioreactor benchtop fabrication began in FabLab DTU following formal proposal approval.',
          type: 'STAGE_TRANSITION',
          createdAt: new Date(Date.now() - 4 * 86400000)
        },
        {
          user: faculty._id,
          userName: 'Prof. S. K. Sharma',
          userRole: 'FACULTY',
          title: 'Milestone 2 Completed',
          content: 'CAD Chassis & Stirrer Engineering Schematics completed and sent for skid manufacturing.',
          type: 'MILESTONE_COMPLETION',
          createdAt: new Date(Date.now() - 3 * 86400000)
        }
      ],
      comments: [
        {
          user: citizen._id,
          userName: 'Sunita Sharma (RWA President)',
          userRole: 'CLIENT',
          comment: 'Very glad to see practical progress on Ghazipur odor reduction! Residents are eagerly waiting for the pilot.',
          createdAt: new Date(Date.now() - 2 * 86400000)
        },
        {
          user: industry._id,
          userName: 'Tata Power Delhi Innovation Hub',
          userRole: 'INDUSTRY',
          comment: 'Tata Power engineers have cleared the LoRaWAN telemetry frequency permits at Ghazipur substation.',
          createdAt: new Date(Date.now() - 1 * 86400000)
        }
      ]
    });

    const t1 = await Team.create({
      name: 'BioMethan-X Innovation Cohort',
      university: university._id,
      project: p1._id,
      facultyMentor: f1._id,
      members: [
        { student: s2._id, role: 'Team Lead' },
        { student: s1._id, role: 'AI/ML' },
        { student: s3._id, role: 'Hardware' },
        { student: s4._id, role: 'Documentation' }
      ]
    });

    // Update references
    p1.team = t1._id;
    await p1.save();
    await f1.updateOne({ $addToSet: { assignedProjects: p1._id } });
    await Student.updateMany({ _id: { $in: [s1._id, s2._id, s3._id, s4._id] } }, { assignedTeam: t1._id });
    c1.assignedProject = p1._id;
    await c1.save();

    console.log('[Seed] Seeding industry corporate partner profile & initial partnership...');
    const indProfile = await Industry.create({
      user: industry._id,
      name: 'Tata Power Delhi Innovation Hub',
      organizationType: 'Industry',
      industrySector: 'Clean Energy, Smart Grids & Utilities',
      location: 'Netaji Subhash Place, Pitampura, Delhi',
      district: 'North West Delhi',
      website: 'https://www.tatapower-ddl.com',
      expertise: [
        'Clean Energy & Microgrids',
        'IoT Sensor Telemetry',
        'Environmental Engineering',
        'Smart Metering Infrastructure'
      ],
      technologies: ['LoRaWAN', 'SCADA', 'Python Data Analytics', 'Solar Inverters'],
      resources: [
        'High-voltage testing bench',
        'Smart grid telemetry testing facility',
        'Rapid electronics prototype assembly'
      ],
      fundingCapability: {
        maxGrantAmount: 2500000,
        csrBudgetAllocated: 10000000,
        fundingTypes: ['CSR Grant', 'Prototyping Co-Sponsorship', 'Equipment Loan']
      },
      mentorshipCapability: {
        availableMentorsCount: 6,
        domains: ['Embedded Engineering', 'Utility Scaling', 'Product Certification'],
        guidelines: 'Quarterly field reviews and sprint architectural advisement.'
      },
      implementationCapability: {
        fieldTrialSites: ['North Delhi Distribution Circles', 'Ghazipur Substation'],
        pilotSupportLocations: ['Bawana Industrial Area', 'Narela Substation'],
        manufacturingCapacity: 'Electronics rapid assembly and pilot telemetry testing.'
      }
    });

    const part1 = await Partnership.create({
      project: p1._id,
      industry: industry._id,
      industryProfile: indProfile._id,
      university: university._id,
      supportType: 'FUNDING',
      description: 'Tata Power DDL Smart Grid Lab co-sponsoring biomethanation prototype fabrication and LoRaWAN telemetry telemetry interface.',
      resourcesOffered: [
        'LoRaWAN gateway access at Ghazipur Substation',
        '₹15,00,000 direct prototyping grant',
        'Utility engineering mentorship by Senior Grid Officers'
      ],
      expectedInvolvement: 'Monthly sprint reviews and field pilot site commissioning at Ghazipur Gate 2.',
      fundingAmount: 1500000,
      status: 'ACTIVE'
    });

    // Add industry._id to p1.industryPartners
    await Project.findByIdAndUpdate(p1._id, { $addToSet: { industryPartners: industry._id } });

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
