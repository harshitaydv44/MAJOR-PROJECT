const Student = require('../models/Student');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get students
 * GET /api/students
 */
const getStudents = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'UNIVERSITY') {
      filter.university = req.user.id;
    } else if (req.user.role === 'STUDENT') {
      // Return student profile for caller or their peers in university
      const s = await Student.findOne({ user: req.user.id });
      if (s) filter.university = s.university;
    }

    const students = await Student.find(filter)
      .populate('assignedTeam', 'name project')
      .sort({ name: 1 });

    return successResponse(res, 'Student innovator directory retrieved successfully', { students });
  } catch (error) {
    next(error);
  }
};

/**
 * Add student profile
 * POST /api/students
 */
const addStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can add student profiles', null, 403);
    }

    const { name, email, department, year, skills, expertise } = req.body;

    if (!name || !email || !department) {
      return errorResponse(res, 'Name, email, and department are required', null, 400);
    }

    const universityId = req.user.role === 'UNIVERSITY' ? req.user.id : req.body.universityId;

    // Check if user account with this email exists to link
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    const student = await Student.create({
      university: universityId,
      user: existingUser ? existingUser._id : undefined,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department.trim(),
      year: year || '3rd Year B.Tech',
      skills: Array.isArray(skills) ? skills : [],
      expertise: Array.isArray(expertise) ? expertise : []
    });

    return successResponse(res, 'Student profile created successfully', { student }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile
 * PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can update student records', null, 403);
    }

    const { id } = req.params;
    const { name, department, year, skills, expertise, isActive } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 'Student record not found', null, 404);
    }

    if (req.user.role === 'UNIVERSITY' && student.university.toString() !== req.user.id) {
      return errorResponse(res, 'Unauthorized to modify student of another institution', null, 403);
    }

    if (name) student.name = name.trim();
    if (department) student.department = department.trim();
    if (year) student.year = year.trim();
    if (Array.isArray(skills)) student.skills = skills;
    if (Array.isArray(expertise)) student.expertise = expertise;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();

    return successResponse(res, 'Student profile updated successfully', { student });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove student profile
 * DELETE /api/students/:id
 */
const removeStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can remove student records', null, 403);
    }

    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 'Student record not found', null, 404);
    }

    if (req.user.role === 'UNIVERSITY' && student.university.toString() !== req.user.id) {
      return errorResponse(res, 'Unauthorized to remove student of another institution', null, 403);
    }

    student.isActive = false;
    await student.save();

    return successResponse(res, 'Student profile removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  addStudent,
  updateStudent,
  removeStudent
};
