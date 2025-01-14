import {
  MORE_PLEASE,
  OK,
  SuggestionResponseSuccess, SuggestionServiceRequest,
  SuggestionServiceResponse,
  SuggestionServiceResponseMissingData
} from '@ai-menu/api-commons';
import { MENU } from './menu';

const THOUGHTS = 'thoughts' satisfies keyof SuggestionServiceResponse;
const STATUS = 'status' satisfies keyof SuggestionServiceResponse;
const SERVICES = 'services' satisfies keyof SuggestionResponseSuccess;
const SERVICES_HTML = 'servicesHtml' satisfies keyof SuggestionResponseSuccess;
const SPECIFICS = 'specifics' satisfies keyof SuggestionServiceResponseMissingData;

const SERVICES_JSON_SAMPLE_TXT = `Problem: Manual processing of electronic invoices is time-consuming and prone to human error. Additionally, it requires significant resources to handle tasks typically performed by accounting assistants, leading to higher operational costs.
Solution: Develop an automated system for extracting information from electronic invoices. The system captures critical data, such as seller information and dates, and stores it in a relational database for further processing. This automation reduces human involvement, minimizes errors, and significantly lowers personnel expenses.`.replace('\n', '\\n');

const SERVICES_JSON_SAMPLE_HTML = `<h1>Invoice Processing Automation</h1>
<h2>Problem:</h2>
<p>Manual processing of electronic invoices is time-consuming and prone to human error. Additionally, it requires significant resources to handle tasks typically performed by accounting assistants, leading to higher operational costs.</p>
<h2>Solution:</h2>
<p>Develop an automated system for extracting information from electronic invoices. The system captures critical data, such as seller information and dates, and stores it in a relational database for further processing. This automation reduces human involvement, minimizes errors, and significantly lowers personnel expenses.</p>`.replace('\n', '\\n');

// TODO use JSON schema instead but make sure "thoughts" is the first field
export const PROMPT = (request: Pick<SuggestionServiceRequest, 'companyDomain'>) => `
You are a helpful assistant who provides correct and truthful information about services that software development company Monadical provides. Based on the context you have, help the potential lead to learn about how Monadical can help their company with AI integrations and development work. If you have enough context, respond with correctly formatted and escaped JSON {"thoughts": "$YOUR_THOUGHT_PROCESS", "status": "ok", "services": "$SERVICES_IN_PLAIN_TEXT", "servicesHtml": "$SERVICES_FORMATTED_IN_HTML"}
Html format can have simple tags like Markdown has.
If there’s not enough data, don’t invent anything, but respond with JSON {"thoughts": "$YOUR_THOUGHT_PROCESS", "status": "morePlease", "specifics": "$WHAT_INFO_YOU_SUGGEST_OUR_LEAD_TO_ADD_TO_QUERY"}
Respond only with the JSON of the format I gave you. Always include both problem and solution.

the dataset is:

!!!BEGIN_DATASET!!!

${MENU}

!!!END_DATASET!!!

Let's begin!

Q: company domain: accounting
A: {"${THOUGHTS}": "The company is accounting company. In the dataset, I see a common problem for accounting companies, which is manual document processing. I will show the problem and solution domains from the data set I have", "${STATUS}": "${OK}", ${SERVICES}: "${SERVICES_JSON_SAMPLE_TXT}", "${SERVICES_HTML}": "${SERVICES_JSON_SAMPLE_HTML}", "${STATUS}": "${OK}"}
Q: company domain: ufo sightings
A: {"${THOUGHTS}": "I have nothing related to ufo sightings in my dataset. I should ask for more data", "${STATUS}": "${MORE_PLEASE}", "${SPECIFICS}": "please provide more info about your company and challenges you experience"}
Q: company domain: ${request.companyDomain}
A:
`;
