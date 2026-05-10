export const DV_CONTACTS = [
  { flag:"🇳🇬", country:"Nigeria", lines:[
    { name:"WARDC Hotline", num:"0800-033-0000" },
    { name:"Lagos DSVRT", num:"08000333333" },
    { name:"FIDA Nigeria", num:"01-8000002" },
  ]},
  { flag:"🇬🇧", country:"UK", lines:[
    { name:"National DV Helpline", num:"0808 2000 247" },
    { name:"Refuge 24/7", num:"0808 2000 247" },
  ]},
  { flag:"🇨🇦", country:"Canada", lines:[
    { name:"ShelterSafe", num:"1-800-799-7233" },
  ]},
  { flag:"🇺🇸", country:"USA", lines:[
    { name:"NDVH", num:"1-800-799-7233" },
  ]},
];

export const SEXUAL_HEALTH = [
  { icon:"💉", title:"STI Testing", desc:"Know your status — free or low-cost testing available at most government health centres in Nigeria (PEPFAR-funded sites).", tag:"All regions" },
  { icon:"🦠", title:"HIV/AIDS", desc:"Free ARV treatment at all Nigerian government hospitals. In UK: NHS sexual health clinics free & confidential.", tag:"Free care" },
  { icon:"🔵", title:"PrEP Access", desc:"PrEP (HIV prevention pill) available at select PEPFAR sites in Lagos, Abuja, Rivers State. Free in UK on NHS.", tag:"Prevention" },
  { icon:"🩸", title:"HPV Vaccination", desc:"HPV vaccine recommended for girls 9–14 in Nigeria (NPHCDA). Free in UK under NHS (up to age 25).", tag:"Vaccination" },
];

export const REPORT_STEPS = [
  { n:"1", title:"Get to Safety", body:"Leave if you can. Go to a neighbour, family member, or public place. Take children with you." },
  { n:"2", title:"Call Emergency Services", body:"Nigeria: 199 (Police) / 122 (Lagos Emergency). UK: 999. USA/CA: 911." },
  { n:"3", title:"Preserve Evidence", body:"Photograph injuries. Keep any threatening messages. Write down dates and times while memory is fresh." },
  { n:"4", title:"Seek Medical Care", body:"Any government hospital A&E must treat DV survivors. Request a PEP starter pack if sexually assaulted (within 72 h)." },
  { n:"5", title:"Contact a DV Organisation", body:"Call WARDC, Mirabel Centre (Lagos), or your nearest shelter. They can provide legal aid and safe housing." },
  { n:"6", title:"Know Your Rights (VAPP)", body:"Nigeria's VAPP Act 2015 criminalises all forms of domestic violence. You can obtain a protection order from a magistrate court." },
];

export const FREE_CLINICS = [
  { flag:"🇳🇬", name:"Lagos Island General Hospital", detail:"Free antenatal, STI, family planning", area:"Lagos Island" },
  { flag:"🇳🇬", name:"Rivers State Teaching Hospital", detail:"Free STI/HIV testing (PEPFAR)", area:"Port Harcourt" },
  { flag:"🇳🇬", name:"PEPFAR-Funded Sites", detail:"Free HIV test + ARV treatment, all 36 states", area:"Nationwide" },
  { flag:"🇬🇧", name:"NHS Sexual Health Clinic", detail:"Free STI, contraception, HIV test — no GP referral needed", area:"All UK regions" },
  { flag:"🇨🇦", name:"Sexual Health Clinic (ON/BC/AB)", detail:"Free or low-cost — walk-in, confidential", area:"Canada" },
  { flag:"🇺🇸", name:"Planned Parenthood", detail:"Sliding-scale STI testing, contraception, PrEP", area:"USA" },
];
