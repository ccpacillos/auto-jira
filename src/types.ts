export type Status =
  | 'In Progress'
  | 'In Review'
  | 'Merge In Dev'
  | 'RFT'
  | 'QA In Progress'
  | 'QA Failed'
  | 'UAT'
  | 'Ready for PROD Deploy'
  | 'RFT - PROD'
  | 'RFT - PROD Fail'
  | 'To Do';

export type Issue = {
  key: string;
  fields: {
    summary: string;
    status: {
      name: Status;
    };
    assignee: { displayName: string } | null;
    labels: string[];
    priority: {
      name: string;
    };
    issuetype: {
      name: string;
    };
  };
};
