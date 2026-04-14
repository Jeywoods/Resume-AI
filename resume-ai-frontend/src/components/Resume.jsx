import React, { useRef } from "react";
import { FaGithub, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCar } from "react-icons/fa";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

const PDF_CONFIG = {
  pageMargins: { top: 5, bottom: 0, left: 2, right: 2 },
  sectionSpacing: 4,
  photoOffset: { x: 0, y: 0 },
  displayWidth: '800px',
  photoSize: '140px'
};

const Resume = ({ data }) => {
  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  
  // Refs для каждого элемента внутри секций
  const experienceRefs = useRef([]);
  const projectRefs = useRef([]);
  const skillRefs = useRef([]);
  const educationRefs = useRef([]);
  const certificationRefs = useRef([]);
  const achievementRefs = useRef([]);
  const languageRefs = useRef([]);
  const interestRefs = useRef([]);

  const handleDownloadPdf = async () => {
    if (!data) return;
    
    try {
      const loadingToast = toast.loading("Генерация PDF...");
      
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      let currentY = PDF_CONFIG.pageMargins.top;
      
      const addSection = async (ref, spacing = PDF_CONFIG.sectionSpacing) => {
        if (!ref?.current) return currentY;
        const hasContent = ref.current.innerText.trim().length > 0;
        if (!hasContent) return currentY;
        
        const dataUrl = await toPng(ref.current, {
          quality: 0.9,
          pixelRatio: 1.5,
          backgroundColor: '#ffffff',
          cacheBust: true,
          skipAutoScale: true
        });
        
        const img = new Image();
        img.src = dataUrl;
        
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = pdfWidth - PDF_CONFIG.pageMargins.left - PDF_CONFIG.pageMargins.right;
            const imgHeight = (img.height * imgWidth) / img.width;
            
            if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - PDF_CONFIG.pageMargins.bottom) {
              pdf.addPage();
              currentY = PDF_CONFIG.pageMargins.top;
            }
            
            pdf.addImage(dataUrl, 'PNG', PDF_CONFIG.pageMargins.left + PDF_CONFIG.photoOffset.x, currentY + PDF_CONFIG.photoOffset.y, imgWidth, imgHeight);
            currentY += imgHeight + spacing;
            resolve();
          };
        });
        return currentY;
      };
      
      // Функция для добавления заголовка секции
      const addTitle = async (title, spacing = 8) => {
        const titleDiv = document.createElement('div');
        titleDiv.style.width = PDF_CONFIG.displayWidth;
        titleDiv.style.backgroundColor = 'white';
        titleDiv.style.padding = '20px 30px 0 30px';
        titleDiv.innerHTML = `<h2 style="font-size: 18px; font-weight: 600; color: #667eea; margin-bottom: 16px; border-left: 3px solid #667eea; padding-left: 12px; margin: 0;">${title}</h2>`;
        document.body.appendChild(titleDiv);
        const titleRef = { current: titleDiv };
        await addSection(titleRef, spacing);
        document.body.removeChild(titleDiv);
      };
      
      // 1. Шапка
      await addSection(headerRef);
      
      // 2. О себе
      await addSection(summaryRef);
      
      // 3. Опыт работы - каждый пункт отдельно
      if (data.experience && data.experience.length > 0) {
        await addTitle("Опыт работы");
        for (let i = 0; i < data.experience.length; i++) {
          if (experienceRefs.current[i]) {
            await addSection(experienceRefs.current[i]);
          }
        }
      }
      
      // 4. Проекты - каждый проект отдельно
      if (data.projects && data.projects.length > 0) {
        await addTitle("Проекты");
        for (let i = 0; i < data.projects.length; i++) {
          if (projectRefs.current[i]) {
            await addSection(projectRefs.current[i]);
          }
        }
      }
      
      // 5. Навыки - каждый навык отдельно
      if (data.skills && data.skills.length > 0) {
        await addTitle("Навыки");
        // Навыки выводим по 2 в строку
        for (let i = 0; i < data.skills.length; i += 2) {
          const rowDiv = document.createElement('div');
          rowDiv.style.width = PDF_CONFIG.displayWidth;
          rowDiv.style.backgroundColor = 'white';
          rowDiv.style.padding = '0 30px 8px 30px';
          rowDiv.style.display = 'flex';
          rowDiv.style.gap = '16px';
          
          const skill1 = data.skills[i];
          const skill2 = data.skills[i + 1];
          
          rowDiv.innerHTML = `
            <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: #f7fafc; border-radius: 10px;">
              <span style="font-weight: 500; color: #1a1a2e; font-size: 13px;">${skill1.title}</span>
              ${skill1.level && skill1.level !== "" && skill1.level !== "Не выбран" ? `<span style="font-size: 11px; padding: 4px 10px; background: ${skill1.level === 'Высокий' ? '#c6f6d5' : (skill1.level === 'Средний' ? '#feebc8' : '#fed7d7')}; color: ${skill1.level === 'Высокий' ? '#276749' : (skill1.level === 'Средний' ? '#c05621' : '#9b2c2c')}; border-radius: 20px; font-weight: 500;">${skill1.level}</span>` : ''}
            </div>
            ${skill2 ? `
            <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: #f7fafc; border-radius: 10px;">
              <span style="font-weight: 500; color: #1a1a2e; font-size: 13px;">${skill2.title}</span>
              ${skill2.level && skill2.level !== "" && skill2.level !== "Не выбран" ? `<span style="font-size: 11px; padding: 4px 10px; background: ${skill2.level === 'Высокий' ? '#c6f6d5' : (skill2.level === 'Средний' ? '#feebc8' : '#fed7d7')}; color: ${skill2.level === 'Высокий' ? '#276749' : (skill2.level === 'Средний' ? '#c05621' : '#9b2c2c')}; border-radius: 20px; font-weight: 500;">${skill2.level}</span>` : ''}
            </div>
            ` : '<div style="flex: 1;"></div>'}
          `;
          
          document.body.appendChild(rowDiv);
          const rowRef = { current: rowDiv };
          await addSection(rowRef, 4);
          document.body.removeChild(rowDiv);
        }
      }
      
      // 6. Образование - каждый элемент отдельно
      if (data.education && data.education.length > 0) {
        await addTitle("Образование");
        for (let i = 0; i < data.education.length; i++) {
          if (educationRefs.current[i]) {
            await addSection(educationRefs.current[i]);
          }
        }
      }
      
      // 7. Сертификаты - каждый сертификат отдельно
      if (data.certifications && data.certifications.length > 0) {
        await addTitle("Сертификаты");
        for (let i = 0; i < data.certifications.length; i++) {
          if (certificationRefs.current[i]) {
            await addSection(certificationRefs.current[i]);
          }
        }
      }
      
      // 8. Достижения - каждое достижение отдельно
      if (data.achievements && data.achievements.length > 0) {
        await addTitle("Достижения");
        for (let i = 0; i < data.achievements.length; i++) {
          if (achievementRefs.current[i]) {
            await addSection(achievementRefs.current[i]);
          }
        }
      }
      
      // 9. Языки - каждый язык отдельно
      if (data.languages && data.languages.length > 0) {
        await addTitle("Языки");
        for (let i = 0; i < data.languages.length; i++) {
          if (languageRefs.current[i]) {
            await addSection(languageRefs.current[i]);
          }
        }
      }
      
      // 10. Интересы - каждый интерес отдельно
      if (data.interests && data.interests.length > 0) {
        await addTitle("Интересы");
        for (let i = 0; i < data.interests.length; i++) {
          if (interestRefs.current[i]) {
            await addSection(interestRefs.current[i]);
          }
        }
      }
      
      pdf.save(`${data?.personalInformation?.fullName || "resume"}.pdf`);
      toast.dismiss(loadingToast);
      toast.success("PDF успешно создан!");
      
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при создании PDF");
    }
  };

  if (!data) return <div className="text-center p-10">Загрузка...</div>;

  const hasSkills = data.skills?.length > 0;
  const hasExperience = data.experience?.length > 0;
  const hasEducation = data.education?.length > 0;
  const hasCertifications = data.certifications?.length > 0;
  const hasProjects = data.projects?.length > 0;
  const hasAchievements = data.achievements?.length > 0;
  const hasLanguages = data.languages?.length > 0;
  const hasInterests = data.interests?.length > 0;
  const hasDrivingLicense = data.drivingLicense?.hasLicense && data.drivingLicense?.categories?.length > 0;

  // Создаём рефы для каждого элемента
  experienceRefs.current = Array(data.experience?.length).fill().map((_, i) => experienceRefs.current[i] || React.createRef());
  projectRefs.current = Array(data.projects?.length).fill().map((_, i) => projectRefs.current[i] || React.createRef());
  educationRefs.current = Array(data.education?.length).fill().map((_, i) => educationRefs.current[i] || React.createRef());
  certificationRefs.current = Array(data.certifications?.length).fill().map((_, i) => certificationRefs.current[i] || React.createRef());
  achievementRefs.current = Array(data.achievements?.length).fill().map((_, i) => achievementRefs.current[i] || React.createRef());
  languageRefs.current = Array(data.languages?.length).fill().map((_, i) => languageRefs.current[i] || React.createRef());
  interestRefs.current = Array(data.interests?.length).fill().map((_, i) => interestRefs.current[i] || React.createRef());

  const hasValidLevel = (level) => {
    return level && level !== "" && level !== "Не выбран";
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={handleDownloadPdf} 
        style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '14px 36px', 
          borderRadius: '40px', 
          fontWeight: '600', 
          border: 'none', 
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
      >
        📄 Скачать PDF
      </button>

      {/* Скрытые секции для PDF */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        
        {/* Шапка */}
        <div ref={headerRef} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '30px' }}>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            {data.personalInformation?.photo && (
              <div style={{ 
                width: PDF_CONFIG.photoSize, 
                height: PDF_CONFIG.photoSize, 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '4px solid #667eea',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <img src={data.personalInformation.photo} alt="Фото" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px', letterSpacing: '-0.5px', wordBreak: 'break-word' }}>
                {data.personalInformation?.fullName || "Имя не указано"}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', color: '#667eea', marginBottom: '12px' }}>
                <FaMapMarkerAlt style={{ marginRight: '8px' }} size={14} />
                <span style={{ fontSize: '14px' }}>{data.personalInformation?.location || "Местоположение не указано"}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '8px' }}>
                {data.personalInformation?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#4a5568', fontSize: '13px', background: '#f7fafc', padding: '6px 12px', borderRadius: '20px' }}>
                    <FaEnvelope style={{ marginRight: '8px', color: '#667eea' }} size={12} />
                    <span>{data.personalInformation.email}</span>
                  </div>
                )}
                {data.personalInformation?.phoneNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#4a5568', fontSize: '13px', background: '#f7fafc', padding: '6px 12px', borderRadius: '20px' }}>
                    <FaPhone style={{ marginRight: '8px', color: '#667eea' }} size={12} />
                    <span>{data.personalInformation.phoneNumber}</span>
                  </div>
                )}
                {data.personalInformation?.gitHub && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#4a5568', fontSize: '13px', background: '#f7fafc', padding: '6px 12px', borderRadius: '20px' }}>
                    <FaGithub style={{ marginRight: '8px', color: '#667eea' }} size={12} />
                    <span style={{ wordBreak: 'break-all' }}>{data.personalInformation.gitHub}</span>
                  </div>
                )}
              </div>
              {hasDrivingLicense && (
                <div style={{ 
                  marginTop: '16px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: '#e6f7e6',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#2e7d32'
                }}>
                  <FaCar size={12} />
                  <span>Водительские права: категории {data.drivingLicense.categories.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* О себе */}
        {data.summary && (
          <div ref={summaryRef} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '20px 30px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              padding: '20px',
              borderRadius: '16px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '12px' }}>О себе</h2>
              <p style={{ color: '#4a5568', lineHeight: '1.6', fontSize: '14px' }}>{data.summary}</p>
            </div>
          </div>
        )}

        {/* Каждый опыт работы отдельно */}
        {hasExperience && data.experience.map((exp, idx) => (
          <div key={idx} ref={experienceRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 4px 30px' }}>
            <div style={{ 
              marginBottom: '4px', 
              paddingBottom: '10px', 
              borderBottom: idx !== data.experience.length - 1 ? '1px solid #e2e8f0' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>{exp.jobTitle}</h3>
                  <p style={{ color: '#667eea', fontSize: '12px', fontWeight: '500' }}>{exp.company}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: '#718096' }}>{exp.duration}</p>
                  <p style={{ fontSize: '11px', color: '#718096' }}>{exp.location}</p>
                </div>
              </div>
              {exp.responsibility && (
                <p style={{ color: '#4a5568', marginTop: '6px', fontSize: '12px', lineHeight: '1.4' }}>{exp.responsibility}</p>
              )}
            </div>
          </div>
        ))}

        {/* Каждый проект отдельно */}
        {hasProjects && data.projects.map((proj, idx) => (
          <div key={idx} ref={projectRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 4px 30px' }}>
            <div style={{ 
              marginBottom: '4px', 
              paddingBottom: '10px', 
              borderBottom: idx !== data.projects.length - 1 ? '1px solid #e2e8f0' : 'none'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>{proj.title}</h3>
              <p style={{ color: '#4a5568', fontSize: '12px', lineHeight: '1.4', marginBottom: '6px' }}>{proj.description}</p>
              {proj.technologiesUsed?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {proj.technologiesUsed.map((tech, i) => (
                    <span key={i} style={{ fontSize: '10px', padding: '3px 10px', background: '#edf2f7', color: '#4a5568', borderRadius: '20px' }}>{tech}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Каждое образование отдельно */}
        {hasEducation && data.education.map((edu, idx) => (
          <div key={idx} ref={educationRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 4px 30px' }}>
            <div style={{ 
              marginBottom: '4px', 
              paddingBottom: '10px', 
              borderBottom: idx !== data.education.length - 1 ? '1px solid #e2e8f0' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{edu.degree}</h3>
                  <p style={{ color: '#4a5568', fontSize: '12px' }}>{edu.university}</p>
                  {edu.faculty && (
                    <p style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>Факультет: {edu.faculty}</p>
                  )}
                  {edu.specialty && (
                    <p style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>Специальность: {edu.specialty}</p>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: '#718096', background: '#edf2f7', padding: '3px 8px', borderRadius: '20px' }}>{edu.graduationYear}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Каждый сертификат отдельно */}
        {hasCertifications && data.certifications.map((cert, idx) => (
          <div key={idx} ref={certificationRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 4px 30px' }}>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f7fafc', 
              borderRadius: '8px'
            }}>
              <h3 style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px', marginBottom: '2px' }}>{cert.title}</h3>
              <p style={{ fontSize: '11px', color: '#718096' }}>{cert.issuingOrganization} • {cert.year}</p>
            </div>
          </div>
        ))}

        {/* Каждое достижение отдельно */}
        {hasAchievements && data.achievements.map((ach, idx) => (
          <div key={idx} ref={achievementRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 4px 30px' }}>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f7fafc', 
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{ach.title}</h3>
                <span style={{ fontSize: '11px', color: '#718096', background: '#edf2f7', padding: '2px 8px', borderRadius: '20px' }}>{ach.year}</span>
              </div>
              {ach.extraInformation && (
                <p style={{ color: '#4a5568', fontSize: '12px', marginTop: '4px' }}>{ach.extraInformation}</p>
              )}
            </div>
          </div>
        ))}

        {/* Каждый язык отдельно */}
        {hasLanguages && data.languages.map((lang, idx) => (
          <div key={idx} ref={languageRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 2px 30px' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '5px 14px', 
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', 
              borderRadius: '25px', 
              fontSize: '13px', 
              color: '#667eea', 
              fontWeight: '500'
            }}>{lang.name}</span>
          </div>
        ))}

        {/* Каждый интерес отдельно */}
        {hasInterests && data.interests.map((interest, idx) => (
          <div key={idx} ref={interestRefs.current[idx]} style={{ width: PDF_CONFIG.displayWidth, backgroundColor: 'white', padding: '0 30px 2px 30px' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '5px 14px', 
              background: '#f7fafc', 
              borderRadius: '25px', 
              fontSize: '13px', 
              color: '#4a5568'
            }}>{interest.name}</span>
          </div>
        ))}
      </div>

      {/* ===== ОТОБРАЖЕНИЕ НА ЭКРАНЕ (видимая версия) ===== */}
      <div style={{ 
        width: '800px', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #667eea, #764ba2)' }}></div>
        <div style={{ padding: '30px' }}>
          
          {/* Шапка */}
          <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'center' }}>
            {data.personalInformation?.photo && (
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '4px solid #667eea',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <img src={data.personalInformation.photo} alt="Фото" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px', wordBreak: 'break-word' }}>{data.personalInformation?.fullName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', color: '#667eea', marginBottom: '12px' }}>
                <FaMapMarkerAlt style={{ marginRight: '8px' }} size={14} />
                <span>{data.personalInformation?.location}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '12px' }}>
                {data.personalInformation?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4a5568', background: '#f7fafc', padding: '5px 12px', borderRadius: '20px' }}>
                    <FaEnvelope style={{ marginRight: '8px', color: '#667eea' }} size={12} />
                    <span>{data.personalInformation.email}</span>
                  </div>
                )}
                {data.personalInformation?.phoneNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4a5568', background: '#f7fafc', padding: '5px 12px', borderRadius: '20px' }}>
                    <FaPhone style={{ marginRight: '8px', color: '#667eea' }} size={12} />
                    <span>{data.personalInformation.phoneNumber}</span>
                  </div>
                )}
                {data.personalInformation?.gitHub && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4a5568', background: '#f7fafc', padding: '5px 12px', borderRadius: '20px' }}>
                    <FaGithub style={{ marginRight: '8px', color: '#667eea' }} size={12} />
                    <span style={{ wordBreak: 'break-all' }}>{data.personalInformation.gitHub}</span>
                  </div>
                )}
              </div>
              {hasDrivingLicense && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: '#e6f7e6',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#2e7d32'
                }}>
                  <FaCar size={12} />
                  <span>Водительские права: категории {data.drivingLicense.categories.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* О себе */}
          {data.summary && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '12px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>О себе</h2>
                <p style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.6' }}>{data.summary}</p>
              </div>
            </>
          )}

          {/* Опыт работы */}
          {hasExperience && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '16px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Опыт работы</h2>
                {data.experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>{exp.jobTitle}</h3>
                        <p style={{ color: '#667eea', fontSize: '13px', fontWeight: '500' }}>{exp.company}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', color: '#718096' }}>{exp.duration}</p>
                        <p style={{ fontSize: '12px', color: '#718096' }}>{exp.location}</p>
                      </div>
                    </div>
                    {exp.responsibility && <p style={{ fontSize: '13px', color: '#4a5568', marginTop: '8px' }}>{exp.responsibility}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Проекты */}
          {hasProjects && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '16px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Проекты</h2>
                {data.projects.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>{proj.title}</h3>
                    <p style={{ fontSize: '13px', color: '#4a5568', marginTop: '4px' }}>{proj.description}</p>
                    {proj.technologiesUsed?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {proj.technologiesUsed.map((tech, i) => (
                          <span key={i} style={{ fontSize: '10px', padding: '4px 10px', background: '#edf2f7', borderRadius: '20px', color: '#4a5568' }}>{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Навыки */}
          {hasSkills && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '16px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Навыки</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {data.skills.map((skill, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f7fafc', borderRadius: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>{skill.title}</span>
                      {hasValidLevel(skill.level) && (
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          background: skill.level === 'Высокий' ? '#c6f6d5' : (skill.level === 'Средний' ? '#feebc8' : '#fed7d7'),
                          color: skill.level === 'Высокий' ? '#276749' : (skill.level === 'Средний' ? '#c05621' : '#9b2c2c'),
                          borderRadius: '20px' 
                        }}>{skill.level}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Образование */}
          {hasEducation && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '16px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Образование</h2>
                {data.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>{edu.degree}</h3>
                        <p style={{ fontSize: '13px', color: '#4a5568' }}>{edu.university}</p>
                        {edu.faculty && <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Факультет: {edu.faculty}</p>}
                        {edu.specialty && <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Специальность: {edu.specialty}</p>}
                      </div>
                      <p style={{ fontSize: '12px', color: '#718096', background: '#edf2f7', padding: '4px 10px', borderRadius: '20px' }}>{edu.graduationYear}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Сертификаты */}
          {hasCertifications && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '16px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Сертификаты</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {data.certifications.map((cert, idx) => (
                    <div key={idx} style={{ padding: '10px', background: '#f7fafc', borderRadius: '10px' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a2e' }}>{cert.title}</h3>
                      <p style={{ fontSize: '11px', color: '#718096' }}>{cert.issuingOrganization} • {cert.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Достижения */}
          {hasAchievements && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '16px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Достижения</h2>
                {data.achievements.map((ach, idx) => (
                  <div key={idx} style={{ padding: '12px', background: '#f7fafc', borderRadius: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a2e' }}>{ach.title}</h3>
                      <span style={{ fontSize: '11px', color: '#718096', background: '#edf2f7', padding: '2px 8px', borderRadius: '20px' }}>{ach.year}</span>
                    </div>
                    {ach.extraInformation && <p style={{ fontSize: '12px', color: '#4a5568', marginTop: '6px' }}>{ach.extraInformation}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Языки и Интересы */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
            {hasLanguages && (
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '12px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Языки</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {data.languages.map((lang, idx) => (
                    <span key={idx} style={{ padding: '6px 16px', background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '25px', fontSize: '13px', color: '#667eea', fontWeight: '500' }}>{lang.name}</span>
                  ))}
                </div>
              </div>
            )}
            {hasInterests && (
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginBottom: '12px', borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>Интересы</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {data.interests.map((interest, idx) => (
                    <span key={idx} style={{ padding: '6px 16px', background: '#f7fafc', borderRadius: '25px', fontSize: '13px', color: '#4a5568' }}>{interest.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;