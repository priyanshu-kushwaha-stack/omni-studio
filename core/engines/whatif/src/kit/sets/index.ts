// The set library: reuse one of these before drawing a new set. Each set is drawn for REF, takes its light from the
// mood (`> MOOD:`), names its spots and cameras, and has an example composition (examples/set-library renders every
// set in all six moods).
import type { SetDef } from "./common";
import { balcony } from "./Balcony";
import { bazaar } from "./Bazaar";
import { bedroom } from "./Bedroom";
import { bus } from "./Bus";
import { chaiStall } from "./ChaiStall";
import { classroom } from "./Classroom";
import { courtyard } from "./Courtyard";
import { dining } from "./Dining";
import { hostelRoom } from "./HostelRoom";
import { kitchen } from "./Kitchen";
import { metroCoach } from "./MetroCoach";
import { metroPlatform } from "./MetroPlatform";
import { officeDesk } from "./OfficeDesk";
import { phone } from "./Phone";
import { street } from "./Street";

export * from "./common";
export * from "./cast";
export * from "./props";
export { OnSpot, SetScene } from "./SetScene";
export { balcony, type BalconyOptions } from "./Balcony";
export { bazaar, type BazaarOptions } from "./Bazaar";
export { bedroom, type BedroomOptions } from "./Bedroom";
export { bus, type BusOptions } from "./Bus";
export { chaiStall, type ChaiStallOptions } from "./ChaiStall";
export { classroom, type ClassroomOptions } from "./Classroom";
export { courtyard, type CourtyardOptions } from "./Courtyard";
export { dining, type DiningOptions } from "./Dining";
export { hostelRoom, type HostelRoomOptions } from "./HostelRoom";
export { kitchen, type KitchenOptions } from "./Kitchen";
export { metroCoach, type MetroCoachOptions } from "./MetroCoach";
export { metroPlatform, type MetroPlatformOptions } from "./MetroPlatform";
export { officeDesk, type OfficeDeskOptions } from "./OfficeDesk";
export { phone, type PhoneOptions } from "./Phone";
export { Auto, CityBus, street, type StreetOptions } from "./Street";

/** Every set, in the order of the library's contact sheet: travel, home, work and study, outside. */
export const SET_LIST = [
  metroPlatform, metroCoach, bus,
  kitchen, bedroom, dining, courtyard, balcony,
  classroom, officeDesk, hostelRoom,
  street, bazaar, chaiStall, phone,
] as unknown as SetDef<never>[];

/** Every set, by name. */
export const SETS: Record<string, SetDef<never>> = Object.fromEntries(SET_LIST.map((s) => [s.name, s]));
