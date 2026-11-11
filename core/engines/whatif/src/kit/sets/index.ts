// The set library: reuse one of these before drawing a new set. Each set is drawn for REF, takes its light from the
// mood (`> MOOD:`), names its spots and cameras, and has an example composition (examples/set-library renders every
// set in all six moods).
import type { SetDef } from "./common";
import { balcony } from "./Balcony";
import { bankAtm } from "./BankAtm";
import { bazaar } from "./Bazaar";
import { bedroom } from "./Bedroom";
import { bus } from "./Bus";
import { canteen } from "./Canteen";
import { chaiStall } from "./ChaiStall";
import { citySkyline } from "./CitySkyline";
import { classroom } from "./Classroom";
import { courtyard } from "./Courtyard";
import { dining } from "./Dining";
import { examHall } from "./ExamHall";
import { festivalStreet } from "./FestivalStreet";
import { gamingDesk } from "./GamingDesk";
import { gullyCricket } from "./GullyCricket";
import { hospitalCorridor } from "./HospitalCorridor";
import { hostelRoom } from "./HostelRoom";
import { kitchen } from "./Kitchen";
import { metroCoach } from "./MetroCoach";
import { metroPlatform } from "./MetroPlatform";
import { officeDesk } from "./OfficeDesk";
import { phone } from "./Phone";
import { rooftop } from "./Rooftop";
import { schoolCorridor } from "./SchoolCorridor";
import { sleeperCoach } from "./SleeperCoach";
import { stadium } from "./Stadium";
import { street } from "./Street";
import { trainPlatform } from "./TrainPlatform";
import { tvStudio } from "./TvStudio";
import { weddingHall } from "./WeddingHall";

export * from "./common";
export * from "./cast";
export * from "./props";
export { OnSpot, SetScene } from "./SetScene";
export { balcony, type BalconyOptions } from "./Balcony";
export { bankAtm, type BankAtmOptions } from "./BankAtm";
export { bazaar, type BazaarOptions } from "./Bazaar";
export { bedroom, type BedroomOptions } from "./Bedroom";
export { bus, type BusOptions } from "./Bus";
export { canteen, type CanteenOptions } from "./Canteen";
export { chaiStall, type ChaiStallOptions } from "./ChaiStall";
export { citySkyline, type CitySkylineOptions } from "./CitySkyline";
export { classroom, type ClassroomOptions } from "./Classroom";
export { courtyard, type CourtyardOptions } from "./Courtyard";
export { dining, type DiningOptions } from "./Dining";
export { examHall, type ExamHallOptions } from "./ExamHall";
export { festivalStreet, Sparkler, type FestivalStreetOptions } from "./FestivalStreet";
export { gamingDesk, type GamingDeskOptions } from "./GamingDesk";
export { Bat, gullyCricket, type GullyCricketOptions } from "./GullyCricket";
export { hospitalCorridor, type HospitalCorridorOptions } from "./HospitalCorridor";
export { hostelRoom, type HostelRoomOptions } from "./HostelRoom";
export { kitchen, type KitchenOptions } from "./Kitchen";
export { metroCoach, type MetroCoachOptions } from "./MetroCoach";
export { metroPlatform, type MetroPlatformOptions } from "./MetroPlatform";
export { officeDesk, type OfficeDeskOptions } from "./OfficeDesk";
export { phone, type PhoneOptions } from "./Phone";
export { rooftop, type RooftopOptions } from "./Rooftop";
export { schoolCorridor, type SchoolCorridorOptions } from "./SchoolCorridor";
export { sleeperCoach, type SleeperCoachOptions } from "./SleeperCoach";
export { stadium, type StadiumOptions } from "./Stadium";
export { Auto, CityBus, street, type StreetOptions } from "./Street";
export { trainPlatform, type TrainPlatformOptions } from "./TrainPlatform";
export { tvStudio, type TvStudioOptions } from "./TvStudio";
export { weddingHall, type WeddingHallOptions } from "./WeddingHall";

/** Every set, in the order of the library's contact sheet: travel, home, work and study, outside. */
export const SET_LIST: SetDef[] = [
  metroPlatform, metroCoach, bus,
  kitchen, bedroom, dining, courtyard, balcony,
  classroom, officeDesk, hostelRoom,
  street, bazaar, chaiStall, phone,
  // batch 2: the premises that break out (school, a crush, sports, money, gaming), in our viewer's India
  schoolCorridor, examHall, canteen, gamingDesk,
  trainPlatform, sleeperCoach, hospitalCorridor, bankAtm,
  rooftop, festivalStreet, weddingHall, gullyCricket, stadium, citySkyline, tvStudio,
];

/** Every set, by name. */
export const SETS: Record<string, SetDef> = Object.fromEntries(SET_LIST.map((s) => [s.name, s]));
