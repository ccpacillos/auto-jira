export type Status =
  | 'In Progress'
  | 'In Review'
  | 'Merged In Dev'
  | 'RFT'
  | 'QA In Progress'
  | 'QA Failed'
  | 'UAT'
  | 'Ready for PROD Deploy'
  | 'RFT - PROD'
  | 'RFT - PROD Fail'
  | 'To Do'
  | 'Done'
  | "Won't Fix";

export type Issue = {
  key: string;
  fields: {
    summary: string;
    status: {
      name: Status;
    };
    assignee: { displayName: string; accountId: string } | null;
    labels: string[];
    priority: {
      name: string;
    };
    issuetype: {
      name: string;
      id: string;
    };
    timeoriginalestimate: number;
    customfield_10750: string;
    customfield_10799?: string; // date released
    customfield_10800?: string; // start of cycle
    customfield_10801?: string; // staging released
    parent?: { id: string; key: string };
    resolutiondate?: string;
    created: string;
  };
};
