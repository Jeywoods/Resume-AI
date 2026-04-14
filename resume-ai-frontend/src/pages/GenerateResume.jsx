import React, { useState } from "react";
import toast from "react-hot-toast";
import { 
  FaBrain, FaTrash, FaPaperPlane, 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaGithub, FaBriefcase, FaGraduationCap,
  FaCertificate, FaProjectDiagram, FaTrophy, FaLanguage,
  FaHeart, FaCode, FaArrowRight, FaMagic, FaFileAlt, FaPlusCircle, FaCamera, FaCar
} from "react-icons/fa";
import { generateResume } from "../api/ResumeService";
import { useForm, useFieldArray } from "react-hook-form";
import Resume from "../components/Resume";

const GenerateResume = () => {
  const [data, setData] = useState({
    personalInformation: { fullName: "" },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
    interests: [],
    achievements: [],
    drivingLicense: { hasLicense: false, categories: [] }
  });

  const { register, handleSubmit, control, reset, setValue, watch } = useForm({ defaultValues: data });
  const [showFormUI, setShowFormUI] = useState(false);
  const [showResumeUI, setShowResumeUI] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(true);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const experienceFields = useFieldArray({ control, name: "experience" });
  const educationFields = useFieldArray({ control, name: "education" });
  const certificationsFields = useFieldArray({ control, name: "certifications" });
  const projectsFields = useFieldArray({ control, name: "projects" });
  const languagesFields = useFieldArray({ control, name: "languages" });
  const interestsFields = useFieldArray({ control, name: "interests" });
  const skillsFields = useFieldArray({ control, name: "skills" });
  const achievementsFields = useFieldArray({ control, name: "achievements" });

  const hasLicense = watch("drivingLicense.hasLicense");
  const selectedCategories = watch("drivingLicense.categories") || [];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setValue("personalInformation.photo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (category, checked) => {
    let newCategories = [...selectedCategories];
    if (checked) {
      newCategories.push(category);
    } else {
      newCategories = newCategories.filter(c => c !== category);
    }
    setValue("drivingLicense.categories", newCategories);
  };

  const onSubmit = (data) => {
    setData({ ...data });
    setShowFormUI(false);
    setShowPromptInput(false);
    setShowResumeUI(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const responseData = await generateResume(description);
      const cleanedData = {
        ...responseData.data,
        skills: responseData.data.skills?.map(skill => ({
          title: skill.title || "",
          level: skill.level || ""
        })) || [],
        drivingLicense: { hasLicense: false, categories: [] }
      };
      reset(cleanedData);
      toast.success("Резюме успешно создано!", { duration: 3000, position: "top-center" });
      setShowFormUI(true);
      setShowPromptInput(false);
      setShowResumeUI(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.log(error);
      toast.error("Ошибка при создании резюме!");
    } finally {
      setLoading(false);
      setDescription("");
    }
  };

  const handleClear = () => {
    setDescription("");
  };

  const renderInput = (name, label, icon, type = "text") => (
    <div className="form-control w-full mb-4">
      <label className="label">
        <span className="label-text text-base-content flex items-center gap-2">
          {icon} {label}
        </span>
      </label>
      <input
        type={type}
        {...register(name)}
        className="input input-bordered rounded-xl w-full bg-base-100 text-base-content focus:outline-none focus:border-primary transition-all duration-300"
        placeholder={`Введите ${label.toLowerCase()}`}
      />
    </div>
  );

  const renderFieldArray = (fields, label, icon, name, keys, labels) => (
    <div className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="card-header bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {icon} {label}
        </h3>
      </div>
      <div className="card-body p-6">
        {fields.fields.map((field, index) => (
          <div key={field.id} className="relative p-6 rounded-xl bg-base-200 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              #{index + 1}
            </div>
            {keys.map((key, idx) => (
              <div key={key} className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">{labels[idx]}</span>
                </label>
                <input
                  type="text"
                  {...register(`${name}.${index}.${key}`)}
                  className="input input-bordered rounded-lg w-full bg-base-100 focus:outline-none focus:border-primary transition-all duration-300"
                  placeholder={`Введите ${labels[idx].toLowerCase()}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => fields.remove(index)}
              className="btn btn-error btn-sm mt-2 w-full"
            >
              <FaTrash className="mr-2" /> Удалить
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fields.append(keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}))}
          className="btn btn-secondary w-full"
        >
          <FaPlusCircle className="mr-2" /> Добавить {label}
        </button>
      </div>
    </div>
  );

  const SkillsSection = () => {
    const levelOptions = [
      { value: "", label: "Не выбран" },
      { value: "Начальный", label: "Начальный" },
      { value: "Средний", label: "Средний" },
      { value: "Высокий", label: "Высокий" },
    ];

    return (
      <div className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="card-header bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FaCode /> Навыки
          </h3>
        </div>
        <div className="card-body p-6">
          {skillsFields.fields.map((field, index) => (
            <div key={field.id} className="relative p-6 rounded-xl bg-base-200 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                #{index + 1}
              </div>
              
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Название навыка</span>
                </label>
                <input
                  type="text"
                  {...register(`skills.${index}.title`)}
                  className="input input-bordered rounded-lg w-full bg-base-100"
                  placeholder="Например: Java, React, Python..."
                />
              </div>
              
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Уровень владения</span>
                </label>
                <select
                  {...register(`skills.${index}.level`)}
                  className="select select-bordered rounded-lg w-full bg-base-100"
                  defaultValue=""
                >
                  {levelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <button
                type="button"
                onClick={() => skillsFields.remove(index)}
                className="btn btn-error btn-sm mt-2 w-full"
              >
                <FaTrash className="mr-2" /> Удалить
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => skillsFields.append({ title: "", level: "" })}
            className="btn btn-secondary w-full"
          >
            <FaPlusCircle className="mr-2" /> Добавить навык
          </button>
        </div>
      </div>
    );
  };

  const EducationSection = () => {
    const degreeOptions = [
      { value: "", label: "Выберите степень" },
      { value: "Среднее общее образование", label: "Среднее общее образование (школа)" },
      { value: "Среднее профессиональное образование", label: "Среднее профессиональное образование (колледж/техникум)" },
      { value: "Неполное высшее образование", label: "Неполное высшее образование (3+ курса)" },
      { value: "Бакалавр", label: "Бакалавр" },
      { value: "Специалист", label: "Специалист" },
      { value: "Магистр", label: "Магистр" },
      { value: "Кандидат наук", label: "Кандидат наук" },
      { value: "Доктор наук", label: "Доктор наук" },
    ];

    return (
      <div className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="card-header bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FaGraduationCap /> Образование
          </h3>
        </div>
        <div className="card-body p-6">
          {educationFields.fields.map((field, index) => (
            <div key={field.id} className="relative p-6 rounded-xl bg-base-200 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                #{index + 1}
              </div>
              
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Степень / Уровень образования</span>
                </label>
                <select
                  {...register(`education.${index}.degree`)}
                  className="select select-bordered rounded-lg w-full bg-base-100"
                  defaultValue=""
                >
                  {degreeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Университет / Учебное заведение</span>
                </label>
                <input
                  type="text"
                  {...register(`education.${index}.university`)}
                  className="input input-bordered rounded-lg w-full bg-base-100"
                  placeholder="Например: МГУ им. Ломоносова, СПбГУ..."
                />
              </div>

              {/* Факультет - новое поле */}
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Факультет</span>
                </label>
                <input
                  type="text"
                  {...register(`education.${index}.faculty`)}
                  className="input input-bordered rounded-lg w-full bg-base-100"
                  placeholder="Например: Факультет вычислительной математики и кибернетики..."
                />
              </div>
              
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Специальность</span>
                </label>
                <input
                  type="text"
                  {...register(`education.${index}.specialty`)}
                  className="input input-bordered rounded-lg w-full bg-base-100"
                  placeholder="Например: Программная инженерия, Прикладная математика..."
                />
              </div>
              
              <div className="mb-4">
                <label className="label">
                  <span className="label-text text-sm font-medium">Год окончания</span>
                </label>
                <input
                  type="text"
                  {...register(`education.${index}.graduationYear`)}
                  className="input input-bordered rounded-lg w-full bg-base-100"
                  placeholder="Например: 2020, 2024..."
                />
              </div>
              
              <button
                type="button"
                onClick={() => educationFields.remove(index)}
                className="btn btn-error btn-sm mt-2 w-full"
              >
                <FaTrash className="mr-2" /> Удалить
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => educationFields.append({ degree: "", university: "", faculty: "", specialty: "", graduationYear: "" })}
            className="btn btn-secondary w-full"
          >
            <FaPlusCircle className="mr-2" /> Добавить образование
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <FaBrain className="text-5xl" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            AI Resume Builder
          </h1>
          <p className="text-lg md:text-xl opacity-95">
            Создайте профессиональное резюме за 5 минут с помощью искусственного интеллекта
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {showPromptInput && (
          <div className="max-w-4xl mx-auto">
            <div className="card bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1"></div>
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                    <FaMagic className="text-4xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Расскажите о себе</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Опишите ваш опыт, навыки и карьерные цели — AI создаст идеальное резюме
                  </p>
                </div>

                <textarea
                  disabled={loading}
                  className="textarea textarea-bordered w-full h-64 mb-6 resize-none rounded-xl p-6 text-lg focus:outline-none focus:border-blue-500 transition-all duration-300"
                  placeholder="Например:&#10;Я Java-разработчик с 3 годами опыта. Работал над финтех-проектами, имею опыт с Spring Boot, микросервисами. Ищу позицию Senior Java Developer в продуктовой компании..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    disabled={loading}
                    onClick={handleGenerate}
                    className="btn btn-primary flex items-center gap-2 px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
                  >
                    {loading && <span className="loading loading-spinner"></span>}
                    <FaPaperPlane />
                    Создать резюме
                  </button>
                  <button
                    onClick={handleClear}
                    className="btn btn-secondary flex items-center gap-2 px-8 py-3 text-lg"
                  >
                    <FaTrash /> Очистить
                  </button>
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Совет: Чем подробнее описание, тем качественнее получится резюме
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFormUI && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Редактирование резюме</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Заполните все поля или отредактируйте сгенерированные данные</p>
              </div>
              <div className="badge badge-primary badge-lg">Шаг 2 из 2</div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-1"></div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaUser className="text-green-600" /> Личная информация
                  </h3>
                  
                  {photoPreview && (
                    <div className="mb-6 flex justify-center">
                      <img src={photoPreview} alt="Фото" className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg" />
                    </div>
                  )}
                  
                  <div className="form-control w-full mb-6">
                    <label className="label">
                      <span className="label-text text-base-content flex items-center gap-2">
                        <FaCamera className="text-gray-400" /> Загрузить фото
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="file-input file-input-bordered rounded-xl w-full bg-base-100"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("personalInformation.fullName", "Полное имя", <FaUser className="text-gray-400" />)}
                    {renderInput("personalInformation.email", "Email", <FaEnvelope className="text-gray-400" />, "email")}
                    {renderInput("personalInformation.phoneNumber", "Телефон", <FaPhone className="text-gray-400" />, "tel")}
                    {renderInput("personalInformation.location", "Город проживания", <FaMapMarkerAlt className="text-gray-400" />)}
                    {renderInput("personalInformation.gitHub", "GitHub", <FaGithub className="text-gray-400" />, "url")}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaCar className="text-green-600" /> Водительские права
                    </h4>
                    
                    <div className="form-control mb-4">
                      <label className="label cursor-pointer justify-start gap-4">
                        <input
                          type="checkbox"
                          {...register("drivingLicense.hasLicense")}
                          className="checkbox checkbox-primary"
                        />
                        <span className="label-text font-medium text-gray-700">Есть водительские права</span>
                      </label>
                    </div>

                    {hasLicense && (
                      <div className="ml-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <label className="label">
                          <span className="label-text font-semibold text-green-800">Категории прав</span>
                        </label>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {["A", "A1", "B", "B1", "C", "C1", "D", "D1", "E", "M"].map((cat) => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat)}
                                onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                                className="checkbox checkbox-sm checkbox-primary"
                              />
                              <span className="text-gray-700 font-medium">Категория {cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1"></div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <FaFileAlt className="text-orange-600" /> О себе
                  </h3>
                  <textarea
                    {...register("summary")}
                    className="textarea textarea-bordered w-full bg-base-100 rounded-xl p-4 focus:outline-none focus:border-orange-500 transition-all duration-300"
                    rows={6}
                    placeholder="Расскажите о себе, вашем опыте и карьерных целях..."
                  />
                </div>
              </div>

              <SkillsSection />
              {renderFieldArray(experienceFields, "Опыт работы", <FaBriefcase />, "experience", 
                ["jobTitle", "company", "location", "duration", "responsibility"],
                ["Должность", "Компания", "Расположение офиса", "Период", "Обязанности"]
              )}
              {renderFieldArray(projectsFields, "Проекты", <FaProjectDiagram />, "projects", 
                ["title", "description", "technologiesUsed", "githubLink"],
                ["Название", "Описание", "Технологии", "GitHub"]
              )}
              <EducationSection />
              {renderFieldArray(certificationsFields, "Сертификаты", <FaCertificate />, "certifications", 
                ["title", "issuingOrganization", "year", "certificateLink"],
                ["Название", "Организация", "Год", "Ссылка"]
              )}
              {renderFieldArray(achievementsFields, "Достижения", <FaTrophy />, "achievements", 
                ["title", "year", "extraInformation"],
                ["Название", "Год", "Дополнительная информация"]
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFieldArray(languagesFields, "Языки", <FaLanguage />, "languages", 
                  ["name"], ["Название языка"]
                )}
                {renderFieldArray(interestsFields, "Интересы", <FaHeart />, "interests", 
                  ["name"], ["Название интереса"]
                )}
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary btn-lg px-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                  <FaArrowRight className="mr-2" /> Показать резюме
                </button>
              </div>
            </form>
          </div>
        )}

        {showResumeUI && (
          <div>
            <Resume data={data} />
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  setShowPromptInput(true);
                  setShowFormUI(false);
                  setShowResumeUI(false);
                }}
                className="btn btn-secondary btn-lg"
              >
                <FaBrain className="mr-2" /> Создать новое
              </button>
              <button
                onClick={() => {
                  setShowPromptInput(false);
                  setShowFormUI(true);
                  setShowResumeUI(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-primary btn-lg"
              >
                <FaCode className="mr-2" /> Редактировать
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateResume;