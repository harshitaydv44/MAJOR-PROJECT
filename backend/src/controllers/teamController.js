const Team = require('../models/Team');
const Project = require('../models/Project');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get multidisciplinary teams
 * GET /api/teams
 */
const getTeams = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'UNIVERSITY') {
      filter.university = req.user.id;
    } else if (req.user.role === 'FACULTY') {
      const f = await Faculty.findOne({ user: req.user.id });
      if (f) filter.facultyMentor = f._id;
    } else if (req.user.role === 'STUDENT') {
      const s = await Student.findOne({ user: req.user.id });
      if (s) filter['members.student'] = s._id;
    }

    const teams = await Team.find(filter)
      .populate('project', 'title challengeId status')
      .populate('facultyMentor', 'name department specialization')
      .populate('members.student', 'name department year skills')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Multidisciplinary teams retrieved successfully', { teams });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a multidisciplinary team
 * POST /api/teams
 */
const createTeam = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can create teams', null, 403);
    }

    const { name, project, facultyMentor, members } = req.body;

    if (!name) {
      return errorResponse(res, 'Team name is required', null, 400);
    }

    const universityId = req.user.role === 'UNIVERSITY' ? req.user.id : req.body.universityId;

    const team = await Team.create({
      name: name.trim(),
      university: universityId,
      project: project || undefined,
      facultyMentor: facultyMentor || undefined,
      members: Array.isArray(members) ? members : []
    });

    // If project specified, link and advance status to TEAM_FORMED
    if (project) {
      const proj = await Project.findById(project);
      if (proj) {
        proj.team = team._id;
        if (facultyMentor) proj.mentor = facultyMentor;
        await proj.save();
      }
    }

    // Update assignedTeam on member student documents
    if (Array.isArray(members) && members.length > 0) {
      const studentIds = members.map((m) => m.student);
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { assignedTeam: team._id }
      );
    }

    const populated = await Team.findById(team._id)
      .populate('project', 'title challengeId status')
      .populate('facultyMentor', 'name department specialization')
      .populate('members.student', 'name department year skills');

    return successResponse(res, 'Multidisciplinary team created successfully', { team: populated }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a multidisciplinary team
 * PUT /api/teams/:id
 */
const updateTeam = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can update teams', null, 403);
    }

    const { id } = req.params;
    const { name, project, facultyMentor, members } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return errorResponse(res, 'Team not found', null, 404);
    }

    if (req.user.role === 'UNIVERSITY' && team.university.toString() !== req.user.id) {
      return errorResponse(res, 'Unauthorized to modify team of another institution', null, 403);
    }

    if (name) team.name = name.trim();
    if (project !== undefined) team.project = project || undefined;
    if (facultyMentor !== undefined) team.facultyMentor = facultyMentor || undefined;
    if (Array.isArray(members)) team.members = members;

    await team.save();

    // If project was updated, sync project.team
    if (project) {
      await Project.findByIdAndUpdate(project, { team: team._id });
    }

    const populated = await Team.findById(id)
      .populate('project', 'title challengeId status')
      .populate('facultyMentor', 'name department specialization')
      .populate('members.student', 'name department year skills');

    return successResponse(res, 'Team updated successfully', { team: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * Disband/Delete a team
 * DELETE /api/teams/:id
 */
const deleteTeam = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can disband teams', null, 403);
    }

    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return errorResponse(res, 'Team not found', null, 404);
    }

    if (req.user.role === 'UNIVERSITY' && team.university.toString() !== req.user.id) {
      return errorResponse(res, 'Unauthorized to disband team of another institution', null, 403);
    }

    // Clear reference on associated project and students
    await Project.updateMany({ team: id }, { $unset: { team: 1 } });
    await Student.updateMany({ assignedTeam: id }, { $unset: { assignedTeam: 1 } });

    await Team.findByIdAndDelete(id);

    return successResponse(res, 'Team disbanded successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
};
