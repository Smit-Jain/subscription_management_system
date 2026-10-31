// ============================================================
// MOCK DATA — Users / Customers / Staff
// TODO(A): Replace with real API calls from auth service
// ============================================================

export const mockUsers = [
  { id: 'u1',  name: 'Arjun Mehta',     email: 'arjun@techwave.in',      phone: '+91 98200 11234', company: 'TechWave Solutions',   role: 'customer', plan: 'Enterprise', status: 'active',   avatar: null, joined: '2023-03-15', address: '12 MG Road, Bengaluru 560001' },
  { id: 'u2',  name: 'Priya Sharma',    email: 'priya@greenpath.co',      phone: '+91 98765 43210', company: 'GreenPath Pvt Ltd',    role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2023-06-01', address: '45 Anna Salai, Chennai 600002' },
  { id: 'u3',  name: 'Ravi Kumar',      email: 'ravi@novabuild.com',      phone: '+91 70000 22345', company: 'NovaBuild Inc',        role: 'customer', plan: 'Starter',    status: 'overdue',  avatar: null, joined: '2023-08-20', address: '7 Linking Road, Mumbai 400050' },
  { id: 'u4',  name: 'Sunita Rao',      email: 'sunita@cloudnine.io',     phone: '+91 88000 33456', company: 'CloudNine Systems',    role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2023-09-10', address: '56 Connaught Place, Delhi 110001' },
  { id: 'u5',  name: 'Vikram Nair',     email: 'vikram@pixelcraft.in',    phone: '+91 99900 44567', company: 'PixelCraft Studios',   role: 'customer', plan: 'Enterprise', status: 'active',   avatar: null, joined: '2023-11-05', address: '33 FC Road, Pune 411004' },
  { id: 'u6',  name: 'Divya Patel',     email: 'divya@lumina.tech',       phone: '+91 77700 55678', company: 'Lumina Technologies',  role: 'customer', plan: 'Starter',    status: 'paused',   avatar: null, joined: '2024-01-18', address: '21 SG Highway, Ahmedabad 380015' },
  { id: 'u7',  name: 'Anand Joshi',     email: 'anand@velotech.com',      phone: '+91 66600 66789', company: 'VeloTech Pvt Ltd',     role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2024-02-14', address: '8 Jubilee Hills, Hyderabad 500034' },
  { id: 'u8',  name: 'Kavitha Menon',   email: 'kavitha@softedge.in',     phone: '+91 55500 77890', company: 'SoftEdge Solutions',   role: 'customer', plan: 'Enterprise', status: 'active',   avatar: null, joined: '2024-03-22', address: '3 Marine Drive, Kochi 682031' },
  { id: 'u9',  name: 'Rahul Desai',     email: 'rahul@datapulse.co',      phone: '+91 44400 88901', company: 'DataPulse Analytics',  role: 'customer', plan: 'Starter',    status: 'overdue',  avatar: null, joined: '2024-04-08', address: '19 Residency Road, Bengaluru 560025' },
  { id: 'u10', name: 'Meera Krishnan',  email: 'meera@brightcode.io',     phone: '+91 33300 99012', company: 'BrightCode Labs',      role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2024-05-15', address: '2 Boat Club Road, Chennai 600028' },
  { id: 'u11', name: 'Sanjay Gupta',    email: 'sanjay@flexiworks.in',    phone: '+91 22200 10234', company: 'FlexiWorks HR',        role: 'customer', plan: 'Enterprise', status: 'cancelled',avatar: null, joined: '2024-06-01', address: '67 Vasant Vihar, Delhi 110057' },
  { id: 'u12', name: 'Lakshmi Iyer',    email: 'lakshmi@zenwave.com',     phone: '+91 11100 20345', company: 'ZenWave Consulting',   role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2024-07-19', address: '14 Camp Road, Pune 411001' },
  { id: 'u13', name: 'Rohan Verma',     email: 'rohan@nexasoft.in',       phone: '+91 99800 30456', company: 'NexaSoft Technologies',role: 'customer', plan: 'Starter',    status: 'active',   avatar: null, joined: '2024-08-05', address: '5 Banjara Hills, Hyderabad 500034' },
  { id: 'u14', name: 'Pooja Singh',     email: 'pooja@swiftops.co',       phone: '+91 88700 40567', company: 'SwiftOps India',       role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2024-09-12', address: '88 MG Road, Kochi 682016' },
  { id: 'u15', name: 'Kiran Reddy',     email: 'kiran@alphadigital.in',   phone: '+91 77600 50678', company: 'Alpha Digital Works',  role: 'customer', plan: 'Enterprise', status: 'active',   avatar: null, joined: '2024-10-01', address: '47 Linking Road, Mumbai 400054' },
  { id: 'u16', name: 'Neha Agarwal',    email: 'neha@cloudstep.io',       phone: '+91 66500 60789', company: 'CloudStep Systems',    role: 'customer', plan: 'Starter',    status: 'overdue',  avatar: null, joined: '2024-10-25', address: '11 Civil Lines, Allahabad 211001' },
  { id: 'u17', name: 'Ashwin Bhat',     email: 'ashwin@teralink.in',      phone: '+91 55400 70890', company: 'TeraLink Networks',    role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2024-11-10', address: '29 Brigade Road, Bengaluru 560025' },
  { id: 'u18', name: 'Ritu Malhotra',   email: 'ritu@syncflow.com',       phone: '+91 44300 80901', company: 'SyncFlow Automations', role: 'customer', plan: 'Enterprise', status: 'active',   avatar: null, joined: '2024-12-03', address: '6 Park Street, Kolkata 700016' },
  { id: 'u19', name: 'Dinesh Pillai',   email: 'dinesh@edgenova.io',      phone: '+91 33200 90123', company: 'EdgeNova Solutions',   role: 'customer', plan: 'Starter',    status: 'active',   avatar: null, joined: '2025-01-08', address: '77 Anna Nagar, Chennai 600040' },
  { id: 'u20', name: 'Smita Jain',      email: 'smita@futurebyte.co',     phone: '+91 22100 00234', company: 'FutureByte Tech',      role: 'customer', plan: 'Growth',     status: 'active',   avatar: null, joined: '2025-02-20', address: '9 Pedder Road, Mumbai 400026' },
];

export const mockStaff = [
  { id: 's1', name: 'Deepa Nambiar',  email: 'deepa@brightloop.io',   role: 'admin',   department: 'Engineering', phone: '+91 98100 11111', joined: '2022-01-10', status: 'active' },
  { id: 's2', name: 'Kartik Shetty',  email: 'kartik@brightloop.io',  role: 'staff',   department: 'Sales',       phone: '+91 98200 22222', joined: '2022-04-15', status: 'active' },
  { id: 's3', name: 'Anjali Bhatt',   email: 'anjali@brightloop.io',  role: 'staff',   department: 'Finance',     phone: '+91 98300 33333', joined: '2022-07-20', status: 'active' },
  { id: 's4', name: 'Mohit Saxena',   email: 'mohit@brightloop.io',   role: 'staff',   department: 'Support',     phone: '+91 98400 44444', joined: '2023-01-05', status: 'active' },
  { id: 's5', name: 'Farida Khan',    email: 'farida@brightloop.io',  role: 'admin',   department: 'Operations',  phone: '+91 98500 55555', joined: '2023-03-12', status: 'active' },
  { id: 's6', name: 'Rajesh Nair',    email: 'rajesh@brightloop.io',  role: 'staff',   department: 'Sales',       phone: '+91 98600 66666', joined: '2023-06-01', status: 'inactive' },
  { id: 's7', name: 'Swati Kulkarni', email: 'swati@brightloop.io',   role: 'staff',   department: 'Finance',     phone: '+91 98700 77777', joined: '2024-01-08', status: 'active' },
];

export const mockCurrentCustomer = mockUsers[0]; // u1 — logged-in customer demo
