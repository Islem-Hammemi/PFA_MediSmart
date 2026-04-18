const medecinRepository = require("../repository/medecinRepository");
const ticketRepository  = require("../repository/ticketRepository");

const attachQueueInfo = async (doctors) => {
  return await Promise.all(doctors.map(async (doctor) => {
    const queueData = await ticketRepository.getQueueStatus(doctor.id);
    const totalQueue = Number(queueData?.total_queue) || 0;
    const avgTime     = Number(queueData?.avgConsultationTime) || 4;
    return {
      ...doctor,
      queueCount: totalQueue,
      avgConsultationTime: avgTime,
      avgWaitTime: Math.max(0, totalQueue) * avgTime,
    };
  }));
};

const getMedecins = async (search) => {
  let doctors;
  if (!search || search.trim() === "") {
    doctors = await medecinRepository.findAll();
  } else {
    const keyword = `%${search.trim()}%`;
    doctors = await medecinRepository.findBySearch(keyword);
  }
  return await attachQueueInfo(doctors);
};

const getMedecinsPresents = async () => {
  const doctors = await medecinRepository.findPresents();
  return await attachQueueInfo(doctors);
};

const checkInMedecin = async (userId) => {
  if (!userId) throw new Error("userId requis");
  return await medecinRepository.checkIn(userId);
};

const checkOutMedecin = async (userId) => {
  if (!userId) throw new Error("userId requis");
  return await medecinRepository.checkOut(userId);
};



// Médecin de la semaine (meilleure note + plus de tickets)
const getMedecinSemaine = async () => {
  return await medecinRepository.getMedecinSemaine();
};

// Upload photo du médecin
const updatePhoto = async (userId, photoPath) => {
  if (!userId)    throw new Error("userId requis");
  if (!photoPath) throw new Error("photoPath requis");
  return await medecinRepository.updatePhoto(userId, photoPath);
};

module.exports = {
  getMedecins,           
  getMedecinsPresents,   
  checkInMedecin,        
  checkOutMedecin,       
  getMedecinSemaine,     
  updatePhoto,           
};