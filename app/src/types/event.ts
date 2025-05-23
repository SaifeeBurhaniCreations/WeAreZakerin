export interface miqaatProps {
    title: string;
    description: string | null;
    phase: "night" | "day";
    priority: number;
    year: number | null;
  }
  
  export interface eventProps {
    month: number;
    date: number;
    miqaats: miqaatProps[];
  }
  