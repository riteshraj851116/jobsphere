const Company = require("../models/Company");
const Job = require("../models/Job");

const createCompany = async (req, res) => {
  try {
    const {
      name,
      logo,
      description,
      website,
      industry,
      location,
      companySize,
      foundedYear
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Company name and description are required"
      });
    }

    const existingCompany = await Company.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i"
      }
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "A company with this name already exists"
      });
    }

    const company = await Company.create({
      name: name.trim(),
      logo: logo ? logo.trim() : "",
      description: description.trim(),
      website: website ? website.trim() : "",
      industry: industry ? industry.trim() : "",
      location: location ? location.trim() : "",
      companySize: companySize ? companySize.trim() : "",
      foundedYear,
      recruiter: req.user._id
    });

    const populatedCompany = await Company.findById(company._id)
      .populate(
        "recruiter",
        "name username email profilePicture"
      );

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: {
        company: populatedCompany
      }
    });
  } catch (error) {
    console.error("Create Company Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating company"
    });
  }
};

const getCompanies = async (req, res) => {
  try {
    const {
      search = "",
      industry = "",
      location = "",
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    const filter = {};

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i"
          }
        }
      ];
    }

    if (industry.trim()) {
      filter.industry = {
        $regex: industry.trim(),
        $options: "i"
      };
    }

    if (location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i"
      };
    }

    const [companies, totalCompanies] =
      await Promise.all([
        Company.find(filter)
          .populate(
            "recruiter",
            "name username profilePicture"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(itemsPerPage),

        Company.countDocuments(filter)
      ]);

    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalCompanies / itemsPerPage
          ),
          totalCompanies,
          hasNextPage:
            currentPage * itemsPerPage < totalCompanies
        }
      }
    });
  } catch (error) {
    console.error("Get Companies Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching companies"
    });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate(
        "recruiter",
        "name username profilePicture headline"
      );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    const jobs = await Job.find({
      company: company._id,
      status: "active"
    })
      .select(
        "title location jobType experienceLevel salaryMin salaryMax skills createdAt deadline"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        company,
        jobs
      }
    });
  } catch (error) {
    console.error("Get Company Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching company"
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    if (
      company.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own company"
      });
    }

    const allowedFields = [
      "name",
      "logo",
      "description",
      "website",
      "industry",
      "location",
      "companySize",
      "foundedYear"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });

    await company.save();

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: {
        company
      }
    });
  } catch (error) {
    console.error("Update Company Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating company"
    });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    if (
      company.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own company"
      });
    }

    await Job.deleteMany({
      company: company._id
    });

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: "Company and associated jobs deleted successfully"
    });
  } catch (error) {
    console.error("Delete Company Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting company"
    });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};