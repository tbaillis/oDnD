/**
 * Fantasy Name Generator for D&D Character Creation
 * Generates random names based on different fantasy styles and races
 */

interface NameSet {
  prefixes: string[];
  suffixes: string[];
  complete?: string[];
}

interface RaceNameData {
  male: NameSet;
  female: NameSet;
  surnames?: string[];
}

export class FantasyNameGenerator {
  private static nameData: { [key: string]: RaceNameData } = {
    human: {
      male: {
        prefixes: ['Aed', 'Ael', 'Bran', 'Cael', 'Dar', 'Eld', 'Finn', 'Gar', 'Hal', 'Kor', 'Lan', 'Mor', 'Nad', 'Orm', 'Ren', 'Syl', 'Tor', 'Ulric', 'Var', 'Wren'],
        suffixes: ['an', 'ard', 'dus', 'en', 'ic', 'ion', 'is', 'on', 'red', 'ric', 'son', 'ton', 'wick', 'win'],
        complete: ['Alexander', 'Marcus', 'William', 'James', 'Robert', 'Edmund', 'Richard', 'Thomas', 'Arthur', 'Geoffrey']
      },
      female: {
        prefixes: ['Ael', 'Ara', 'Bel', 'Cel', 'Del', 'Ely', 'Fae', 'Gwen', 'Isa', 'Jess', 'Kat', 'Lyn', 'Mir', 'Nel', 'Oli', 'Ros', 'Sel', 'Tess', 'Vera', 'Wyn'],
        suffixes: ['a', 'ana', 'ara', 'dra', 'ena', 'ina', 'ira', 'lia', 'lyn', 'mira', 'na', 'neth', 'ra', 'ssa', 'tha'],
        complete: ['Catherine', 'Elizabeth', 'Margaret', 'Isabella', 'Beatrice', 'Rosalind', 'Cordelia', 'Guinevere', 'Vivian', 'Seraphina']
      },
      surnames: ['Blackwood', 'Stormwind', 'Goldleaf', 'Ironforge', 'Brightblade', 'Shadowmere', 'Thornfield', 'Ravencrest', 'Silverstone', 'Dragonborn', 'Nightfall', 'Starweaver', 'Moonwhisper', 'Flameheart', 'Frostborn']
    },
    
    elf: {
      male: {
        prefixes: ['Ael', 'And', 'Ara', 'Bel', 'Cel', 'Dae', 'Eld', 'Fin', 'Gil', 'Hal', 'Ith', 'Leg', 'Mir', 'Nor', 'Ort', 'Pen', 'Sil', 'Thal', 'Ulf', 'Vel'],
        suffixes: ['adan', 'andreth', 'anor', 'aras', 'dir', 'galad', 'ion', 'las', 'nil', 'orn', 'rond', 'thil', 'uil', 'wion'],
        complete: ['Legolas', 'Elrond', 'Thranduil', 'Celeborn', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir']
      },
      female: {
        prefixes: ['Ael', 'Ara', 'Arw', 'Cel', 'Eld', 'Gal', 'Id', 'Lut', 'Mir', 'Nim', 'Tar', 'Und'],
        suffixes: ['anel', 'ath', 'del', 'driel', 'eth', 'iel', 'ien', 'ith', 'las', 'lyn', 'reth', 'wen'],
        complete: ['Galadriel', 'Arwen', 'Tauriel', 'Nimrodel', 'Elaria', 'Celebrian', 'Idril', 'Luthien']
      },
      surnames: ['Moonwhisper', 'Starweaver', 'Silverleaf', 'Dawnstrider', 'Nightbreeze', 'Goldenheart', 'Stormbow', 'Swiftarrow', 'Brightblade', 'Shadowdancer']
    },
    
    dwarf: {
      male: {
        prefixes: ['Baf', 'Bom', 'Dar', 'Dor', 'Dur', 'Fal', 'Gim', 'Glor', 'Gror', 'Kil', 'Nar', 'Nor', 'Ori', 'Thor', 'Thr'],
        suffixes: ['ain', 'ar', 'din', 'dur', 'i', 'in', 'li', 'mir', 'ni', 'or', 'rim', 'son', 'ur', 'vi'],
        complete: ['Thorin', 'Gimli', 'Balin', 'Dwalin', 'Gloin', 'Oin', 'Bombur', 'Bofur', 'Bifur', 'Dori', 'Nori', 'Ori']
      },
      female: {
        prefixes: ['Bal', 'Dar', 'Dor', 'Fal', 'Gret', 'Hild', 'Kat', 'Myr', 'Nor', 'Ros', 'Sif', 'Tov', 'Val'],
        suffixes: ['a', 'da', 'ga', 'grim', 'hild', 'ina', 'la', 'na', 'ra', 'wyn'],
        complete: ['Disa', 'Mira', 'Vera', 'Nala', 'Kira', 'Magna', 'Helga', 'Sigrid']
      },
      surnames: ['Ironforge', 'Stonebeard', 'Goldaxe', 'Hammerfall', 'Rockbreaker', 'Deepdelver', 'Battlehammer', 'Strongarm', 'Orefinder', 'Shieldbreaker']
    },
    
    halfling: {
      male: {
        prefixes: ['Bil', 'Bun', 'Dil', 'Fro', 'Ham', 'Mer', 'Pal', 'Per', 'Sam', 'Ted', 'Tom', 'Wil'],
        suffixes: ['bo', 'doc', 'do', 'fred', 'gar', 'go', 'ic', 'kin', 'lo', 'mer', 'per', 'ry', 'wise'],
        complete: ['Bilbo', 'Frodo', 'Samwise', 'Peregrin', 'Meriadoc', 'Bandobras', 'Paladin', 'Hamfast']
      },
      female: {
        prefixes: ['Bell', 'Dar', 'Est', 'Lob', 'May', 'Pear', 'Pop', 'Prim', 'Ros', 'Tul'],
        suffixes: ['a', 'elia', 'ella', 'ie', 'ina', 'la', 'ly', 'mina', 'ra', 'wyn'],
        complete: ['Belladonna', 'Primula', 'Pearl', 'Rosie', 'Daisy', 'Poppy', 'Lily', 'Esmeralda']
      },
      surnames: ['Baggins', 'Took', 'Brandybuck', 'Gamgee', 'Proudfoot', 'Bracegirdle', 'Goodbody', 'Burrows', 'Brownlock', 'Greenhill', 'Underhill', 'Fairbairn']
    }
  };

  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate a random first name based on race and gender
   */
  public static generateFirstName(race: string = 'human', gender: string = 'male'): string {
    const raceKey = race.toLowerCase();
    const genderKey = gender.toLowerCase() as 'male' | 'female';
    
    if (!this.nameData[raceKey]) {
      // Fallback to human names if race not found
      return this.generateFirstName('human', gender);
    }

    const nameSet = this.nameData[raceKey][genderKey];
    
    // 30% chance to use a complete name if available
    if (nameSet.complete && Math.random() < 0.3) {
      return this.getRandomElement(nameSet.complete);
    }
    
    // Otherwise generate from prefix + suffix
    const prefix = this.getRandomElement(nameSet.prefixes);
    const suffix = this.getRandomElement(nameSet.suffixes);
    
    return prefix + suffix;
  }

  /**
   * Generate a random surname based on race
   */
  public static generateSurname(race: string = 'human'): string {
    const raceKey = race.toLowerCase();
    
    if (!this.nameData[raceKey] || !this.nameData[raceKey].surnames) {
      return this.generateSurname('human');
    }

    return this.getRandomElement(this.nameData[raceKey].surnames!);
  }

  /**
   * Generate a full random name (first + surname)
   */
  public static generateFullName(race: string = 'human', gender: string = 'male'): string {
    const firstName = this.generateFirstName(race, gender);
    const surname = this.generateSurname(race);
    
    return `${firstName} ${surname}`;
  }

  /**
   * Get available races for name generation
   */
  public static getAvailableRaces(): string[] {
    return Object.keys(this.nameData);
  }

  /**
   * Generate multiple name suggestions
   */
  public static generateSuggestions(count: number = 5, race: string = 'human', gender: string = 'male'): string[] {
    const suggestions = new Set<string>();
    
    while (suggestions.size < count) {
      suggestions.add(this.generateFullName(race, gender));
    }
    
    return Array.from(suggestions);
  }
}
