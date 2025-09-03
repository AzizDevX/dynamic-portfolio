import mongoose from "mongoose";
const staticSeo = mongoose.Schema(
  {
    WebLogo: {
      type: String,
      trim: true,
    },
    Author: {
      type: String,
      trim: true,
    },
    WebsiteName: {
      type: String,
      trim: true,
    },
    LangCode: {
      type: String,
      trim: true,
      maxlength: 2,
    },
    Lang: {
      type: String,
      trim: true,
    },
    CountryCode: {
      type: String,
      trim: true,
      maxlength: 2,
    },
    City: {
      type: String,
      trim: true,
    },
    Geographic: {
      type: String,
      trim: true,
    },
    ICBM: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
const StaticSeo = mongoose.model("StaticSeo", staticSeo);
export default StaticSeo;
