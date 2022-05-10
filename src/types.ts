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
  | 'Done';

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
  };
};
