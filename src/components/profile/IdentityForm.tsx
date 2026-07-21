"use client";

import { useState, useEffect } from "react";
import {
  IdentityProfile,
  EmploymentType,
  Gender,
  ResidenceType,
  EducationLevel,
  FamilyStatus,
  LifeStage,
} from "@/types/profile";
import { EMPLOYMENT_SUBTYPES, getLifeStageFromAge, getLifeStageLabel } from "@/utils/questionBank";

interface Props {
  initialData?: Partial<IdentityProfile>;
  userName?: string;
  onSubmit: (data: IdentityProfile) => void;
}

export default function IdentityForm({ initialData, userName, onSubmit }: Props) {
  const [fullName, setFullName] = useState(initialData?.fullName || userName || "");
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || "");
  const [gender, setGender] = useState<Gender | "">(initialData?.gender || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [region, setRegion] = useState(initialData?.region || "");
  const [residenceType, setResidenceType] = useState<ResidenceType>(initialData?.residenceType || "urban");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(initialData?.educationLevel || "graduate");
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>(initialData?.familyStatus || "single");
  const [dependents, setDependents] = useState(initialData?.dependents ?? 0);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialData?.employmentType || "salaried");
  const [employmentSubType, setEmploymentSubType] = useState(initialData?.employmentSubType || "");

  const [age, setAge] = useState(initialData?.age || 0);
  const [lifeStage, setLifeStage] = useState<LifeStage>("early_career");

  useEffect(() => {
    if (dateOfBirth) {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) calculatedAge--;
      setAge(Math.max(0, calculatedAge));
      setLifeStage(getLifeStageFromAge(calculatedAge) as LifeStage);
    }
  }, [dateOfBirth]);

  useEffect(() => {
    const subtypes = EMPLOYMENT_SUBTYPES[employmentType] || [];
    if (subtypes.length > 0 && !subtypes.includes(employmentSubType)) {
      setEmploymentSubType(subtypes[0]);
    }
  }, [employmentType, employmentSubType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      dateOfBirth,
      age,
      gender: gender || undefined,
      city,
      region,
      residenceType,
      educationLevel,
      familyStatus,
      dependents,
      employmentType,
      employmentSubType,
      lifeStage,
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const subtypes = EMPLOYMENT_SUBTYPES[employmentType] || [];

  const inputClass = "profile-input";
  const labelClass = "profile-label";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className={labelClass}>
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} />
        </div>

        {/* Date of Birth */}
        <div>
          <label className={labelClass}>
            Date of Birth <span className="text-rose-500">*</span>
          </label>
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={today} required className={inputClass} />
          {age > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs text-gray-500">Age: {age}</span>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                {getLifeStageLabel(lifeStage)}
              </span>
            </div>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className={labelClass}>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputClass}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className={labelClass}>
            City <span className="text-rose-500">*</span>
          </label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Bangalore" className={inputClass} />
        </div>

        {/* Region */}
        <div>
          <label className={labelClass}>State / Region</label>
          <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Karnataka" className={inputClass} />
        </div>

        {/* Residence Type */}
        <div>
          <label className={labelClass}>Residence Type</label>
          <select value={residenceType} onChange={(e) => setResidenceType(e.target.value as ResidenceType)} className={inputClass}>
            <option value="urban">Urban</option>
            <option value="semi_urban">Semi-Urban</option>
            <option value="rural">Rural</option>
          </select>
        </div>

        {/* Education */}
        <div>
          <label className={labelClass}>Education Level</label>
          <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value as EducationLevel)} className={inputClass}>
            <option value="below_10th">Below 10th</option>
            <option value="hsc">Higher Secondary (12th)</option>
            <option value="graduate">Graduate</option>
            <option value="postgraduate">Post Graduate</option>
            <option value="professional">Professional (CA, MBA, etc.)</option>
          </select>
        </div>

        {/* Family Status */}
        <div>
          <label className={labelClass}>Family Status</label>
          <select value={familyStatus} onChange={(e) => setFamilyStatus(e.target.value as FamilyStatus)} className={inputClass}>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        {/* Dependents */}
        <div>
          <label className={labelClass}>Number of Dependents</label>
          <input type="number" min={0} max={20} value={dependents} onChange={(e) => setDependents(parseInt(e.target.value) || 0)} className={inputClass} />
        </div>

        {/* Employment Type */}
        <div>
          <label className={labelClass}>
            Employment Type <span className="text-rose-500">*</span>
          </label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className={inputClass}>
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self Employed</option>
            <option value="business_owner">Business Owner</option>
            <option value="retired">Retired</option>
            <option value="student">Student</option>
            <option value="homemaker">Homemaker</option>
          </select>
        </div>

        {/* Employment Sub-Type */}
        {subtypes.length > 0 && (
          <div>
            <label className={labelClass}>
              {employmentType === "salaried" ? "Sector" : "Sub-Type"} <span className="text-rose-500">*</span>
            </label>
            <select value={employmentSubType} onChange={(e) => setEmploymentSubType(e.target.value)} className={inputClass}>
              {subtypes.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="gradient-btn text-white px-8 py-2.5 rounded-xl font-medium text-sm">
          Next &mdash; My Financial Picture &rarr;
        </button>
      </div>
    </form>
  );
}
