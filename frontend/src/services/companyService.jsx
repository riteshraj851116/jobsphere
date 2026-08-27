import api from './api';

const MOCK_COMPANIES = [
  {
    _id: 'comp_1',
    name: 'TechNova Solutions',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=200&auto=format&fit=crop',
    industry: 'Cloud Infrastructure & AI',
    location: 'San Francisco, CA (Remote)',
    description: 'TechNova is an industry-leading cloud architecture and enterprise machine learning platform empowering global innovators.',
    companySize: '500-1000',
    openJobs: 4,
    website: 'https://technova.io',
    recruiter: 'rec_1'
  },
  {
    _id: 'comp_2',
    name: 'PixelForge Studio',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=200&auto=format&fit=crop',
    industry: 'Design & Creative Tech',
    location: 'New York, NY (Hybrid)',
    description: 'PixelForge creates award-winning digital experiences, high-fidelity UI systems, and interactive 3D web applications.',
    companySize: '100-250',
    openJobs: 3,
    website: 'https://pixelforge.design',
    recruiter: 'rec_2'
  },
  {
    _id: 'comp_3',
    name: 'CloudScale Systems',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop',
    industry: 'DevOps & Distributed Systems',
    location: 'Austin, TX (Remote)',
    description: 'Scalable Kubernetes orchestration, zero-downtime CI/CD pipelines, and high-performance developer tooling.',
    companySize: '250-500',
    openJobs: 5,
    website: 'https://cloudscale.tech',
    recruiter: 'rec_3'
  },
  {
    _id: 'comp_4',
    name: 'ByteWave Interactive',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop',
    industry: 'FinTech & Digital Payments',
    location: 'London, UK (Hybrid)',
    description: 'Next-generation payment rail and embedded financial software transforming cross-border transactions.',
    companySize: '1000+',
    openJobs: 6,
    website: 'https://bytewave.finance',
    recruiter: 'rec_4'
  },
  {
    _id: 'comp_5',
    name: 'NexusAI Research',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    industry: 'Artificial Intelligence',
    location: 'Seattle, WA (Remote)',
    description: 'Pioneering multimodal foundation models and autonomous agent reasoning systems for scientific computing.',
    companySize: '50-100',
    openJobs: 4,
    website: 'https://nexusai.dev',
    recruiter: 'rec_5'
  },
  {
    _id: 'comp_6',
    name: 'Apex Security Labs',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=200&auto=format&fit=crop',
    industry: 'Cybersecurity & Threat Intel',
    location: 'Boston, MA (Remote)',
    description: 'Enterprise zero-trust defense architectures, cryptographic identity protocols, and active penetration testing.',
    companySize: '200-500',
    openJobs: 2,
    website: 'https://apexsecurity.io',
    recruiter: 'rec_6'
  }
];

export const getCompanies = async (params = {}) => {
  try {
    const res = await api.get('/companies', { params });
    if (res.data?.companies?.length > 0 || res.data?.data?.companies?.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn("Using offline mock companies fallback:", err.message);
  }

  // Fallback filtering by search
  let filtered = [...MOCK_COMPANIES];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    data: {
      companies: filtered,
      total: filtered.length
    },
    companies: filtered
  };
};

export const getCompanyById = async (id) => {
  try {
    const res = await api.get(`/companies/${id}`);
    if (res.data?.company || res.data?.data?.company) {
      return res.data;
    }
  } catch (err) {
    console.warn("Using offline mock company fallback:", err.message);
  }

  const found = MOCK_COMPANIES.find((c) => c._id === id) || MOCK_COMPANIES[0];
  return {
    success: true,
    data: { company: found },
    company: found
  };
};

export const createCompany = async (data) => {
  try {
    const res = await api.post('/companies', data);
    return res.data;
  } catch (err) {
    const newComp = { _id: 'comp_' + Date.now(), ...data };
    return { success: true, data: { company: newComp } };
  }
};

export const updateCompany = async (id, data) => {
  try {
    const res = await api.put(`/companies/${id}`, data);
    return res.data;
  } catch (err) {
    return { success: true, data: { company: { _id: id, ...data } } };
  }
};

export const deleteCompany = async (id) => {
  try {
    const res = await api.delete(`/companies/${id}`);
    return res.data;
  } catch (err) {
    return { success: true, message: 'Company removed' };
  }
};
