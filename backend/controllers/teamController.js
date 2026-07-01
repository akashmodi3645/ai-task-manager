import Team from '../models/Team.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getBestAssigneeAI } from '../services/aiService.js';

// Create Team
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
        workload: 0
      }]
    });

    console.log('✅ Team created:', team.name);

    res.status(201).json({
      message: 'Team created successfully! 🎉',
      team
    });
  } catch (error) {
    console.error('❌ Create team error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get User's Teams
export const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort('-createdAt');

    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Team Details
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(m => m.user._id.toString() === req.user._id.toString());
    const isOwner = team.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Team
export const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can update team' });
    }

    team.name = name || team.name;
    team.description = description || team.description;

    await team.save();

    res.json({ message: 'Team updated successfully!', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Team
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete team' });
    }

    await team.deleteOne();

    res.json({ message: 'Team deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;

    console.log('=== INVITE MEMBER ===');
    console.log('Team ID:', teamId);
    console.log('Email:', email);

    const team = await Team.findById(teamId).populate('owner', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team owner can invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found with this email. They must register first.' });
    }

    const isMember = team.members.some(
      member => member.user.toString() === userToInvite._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    if (userToInvite._id.toString() === team.owner._id.toString()) {
      return res.status(400).json({ message: 'You are already the team owner' });
    }

    // Add member
    team.members.push({
      user: userToInvite._id,
      role: 'member',
      joinedAt: new Date()
    });

    await team.save();

    console.log('✅ Member added successfully');

    // 🔥 FIXED EMAIL - Proper HTML escaping
    try {
      const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: rgb(245, 245, 245); font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <h1 style="color: rgb(37, 99, 235); margin-bottom: 20px; font-size: 28px;">
      🎉 Team Invitation
    </h1>
    
    <p style="font-size: 16px; color: rgb(51, 51, 51); line-height: 1.6;">
      Hi <strong>${userToInvite.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: rgb(51, 51, 51); line-height: 1.6;">
      <strong>${team.owner.name}</strong> has added you to the team <strong>${team.name}</strong>!
    </p>
    
    <div style="background: rgb(248, 250, 252); padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: rgb(100, 116, 139); font-size: 14px;">
        <strong>Team Description:</strong><br>
        ${team.description || 'No description provided'}
      </p>
    </div>
    
    <a href="http://localhost:5173/teams/${team._id}" 
       style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: rgb(37, 99, 235); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
      View Team Dashboard →
    </a>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid rgb(229, 231, 235);">
    
    <p style="color: rgb(107, 114, 128); font-size: 14px; margin: 10px 0 5px 0;">
      You can now:
    </p>
    <ul style="color: rgb(107, 114, 128); font-size: 14px; padding-left: 20px;">
      <li>View and manage team tasks</li>
      <li>Collaborate with other team members</li>
      <li>Track team progress</li>
    </ul>
    
    <p style="margin-top: 30px; color: rgb(156, 163, 175); font-size: 12px; text-align: center;">
      This is an automated email from AI Task Manager
    </p>
  </div>
</body>
</html>
      `.trim();

      await sendEmail({
        email: userToInvite.email,
        subject: `You've been added to ${team.name}! 🎉`,
        html: emailHTML
      });

      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Email failed:', emailError.message);
      // Don't fail request if email fails
    }

    res.json({ 
      message: `${userToInvite.name} has been added to the team!`,
      team 
    });

  } catch (error) {
    console.error('❌ Invite member error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove a member from the team
export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only the team owner can remove members
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can remove members' });
    }

    // Can't remove the owner
    if (memberId === team.owner.toString()) {
      return res.status(400).json({ message: 'Team owner cannot be removed' });
    }

    const memberExists = team.members.some(m => m.user.toString() === memberId);
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found in this team' });
    }

    team.members = team.members.filter(m => m.user.toString() !== memberId);
    await team.save();

    // Unassign any tasks that were assigned to this member within the team
    await Task.updateMany(
      { team: teamId, assignedTo: memberId },
      { $unset: { assignedTo: 1, assignedBy: 1, assignedAt: 1 } }
    );

    const updatedTeam = await Team.findById(teamId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json({
      message: 'Member removed from the team',
      team: updatedTeam
    });
  } catch (error) {
    console.error('❌ Remove member error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get Team Tasks
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const tasks = await Task.find({ team: teamId })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('user', 'name email')
      .sort('-createdAt');

    console.log(`✅ Found ${tasks.length} tasks`);

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Team Dashboard
export const getTeamDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate('members.user', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const totalTasks = await Task.countDocuments({ team: teamId });
    const completedTasks = await Task.countDocuments({ team: teamId, isCompleted: true });
    const pendingTasks = await Task.countDocuments({ team: teamId, isCompleted: false });

    const memberStats = await Promise.all(
      team.members.map(async (member) => {
        const assigned = await Task.countDocuments({ 
          team: teamId, 
          assignedTo: member.user._id,
          isCompleted: false
        });
        const completed = await Task.countDocuments({ 
          team: teamId, 
          assignedTo: member.user._id,
          isCompleted: true
        });

        return {
          userId: member.user._id,
          name: member.user.name,
          email: member.user.email,
          assigned,
          completed,
          workload: member.workload || 0
        };
      })
    );

    res.json({
      team: {
        name: team.name,
        memberCount: team.members.length
      },
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks: 0,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
      },
      memberStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// AI Task Assignment
export const assignTaskAI = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { taskId } = req.body;

    const task = await Task.findById(taskId);
    const team = await Team.findById(teamId).populate('members.user', 'name email');

    if (!task || !team) {
      return res.status(404).json({ message: 'Task or Team not found' });
    }

    const eligibleMembers = team.members.filter(m => m.role !== 'viewer');
    let bestMember = null;
    let reasoning = null;
    let usedAI = false;

    try {
      const aiResult = await getBestAssigneeAI(task, eligibleMembers);
      if (aiResult?.memberId) {
        bestMember = eligibleMembers.find(m => m.user._id.toString() === aiResult.memberId.toString());
        reasoning = aiResult.reasoning;
        if (bestMember) usedAI = true;
      }
    } catch (aiError) {
      console.warn('⚠️ OpenAI assignment failed, falling back to workload-based logic:', aiError.message);
    }

    // Fallback: lowest-workload member
    if (!bestMember) {
      bestMember = eligibleMembers[0];
      let lowestWorkload = bestMember.workload || 0;
      for (const member of eligibleMembers) {
        const workload = member.workload || 0;
        if (workload < lowestWorkload) {
          lowestWorkload = workload;
          bestMember = member;
        }
      }
    }

    const assignee = bestMember.user;

    task.assignedTo = assignee._id;
    task.assignedBy = req.user._id;
    task.assignedAt = new Date();
    task.team = teamId;

    await task.save();

    bestMember.workload = (bestMember.workload || 0) + 1;
    await team.save();

    res.json({
      message: usedAI
        ? `Task assigned to ${assignee.name} by AI! 🤖`
        : `Task assigned to ${assignee.name} (lowest workload)`,
      task,
      assignee: {
        id: assignee._id,
        name: assignee.name,
        email: assignee.email
      },
      reasoning,
      aiPowered: usedAI
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manual Assignment
export const assignTask = async (req, res) => {
  try {
    const { taskId, userId, teamId } = req.body;

    const task = await Task.findById(taskId);
    const team = await Team.findById(teamId);

    if (!task || !team) {
      return res.status(404).json({ message: 'Task or Team not found' });
    }

    const isMember = team.members.some(m => m.user.toString() === userId);
    if (!isMember) {
      return res.status(400).json({ message: 'Not a team member' });
    }

    task.assignedTo = userId;
    task.assignedBy = req.user._id;
    task.assignedAt = new Date();
    task.team = teamId;

    await task.save();

    const member = team.members.find(m => m.user.toString() === userId);
    if (member) {
      member.workload = (member.workload || 0) + 1;
      await team.save();
    }

    const assignee = await User.findById(userId);

    res.json({
      message: `Task assigned to ${assignee.name}!`,
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Accept Invitation (if you want to use it later)
export const acceptInvitation = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    team.members.push({
      user: req.user._id,
      role: 'member',
      workload: 0,
      joinedAt: new Date()
    });

    await team.save();

    res.json({ 
      message: `You've joined ${team.name}! 🎉`,
      team 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get My Assigned Tasks
export const getMyAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id,
      isCompleted: false
    })
    .populate('team', 'name')
    .populate('assignedBy', 'name email')
    .sort('-priority');

    res.json({ tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
