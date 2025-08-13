import mongoose from "mongoose";
const SkillsShmea = new mongoose.Schema({
  Category: {
    type: String,
    required: true,
    minlength: 1,
  },
  SkillName: {
    type: String,
    required: true,
    minlength: 1,
  },
  Skill_Level: {
    type: Number,
    required: true,
  },
});
const Skills = mongoose.model("Skills", SkillsShmea);
export default Skills;
