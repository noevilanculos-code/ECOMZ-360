export interface GoogleDriveFormFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleFormQuestionItem {
  itemId: string;
  title: string;
  description?: string;
  questionItem?: {
    question: {
      questionId: string;
      required?: boolean;
      choiceQuestion?: {
        type: string;
        options: { value: string }[];
      };
      textQuestion?: {
        paragraph?: boolean;
      };
      scaleQuestion?: {
        low: number;
        high: number;
        lowLabel?: string;
        highLabel?: string;
      };
    };
  };
}

export interface GoogleFormDetails {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  settings?: any;
  items?: GoogleFormQuestionItem[];
  responderUri?: string;
  revisionId?: string;
}

export interface GoogleFormResponseAnswer {
  questionId: string;
  textAnswers?: {
    answers: { value: string }[];
  };
}

export interface GoogleFormSubmission {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  respondentEmail?: string;
  answers?: Record<string, GoogleFormResponseAnswer>;
}

export interface GoogleFormResponsesList {
  responses?: GoogleFormSubmission[];
  nextPageToken?: string;
}

/**
 * Lists user's Google Forms from Google Drive
 */
export async function listUserForms(accessToken: string): Promise<GoogleDriveFormFile[]> {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.form' and trashed=false&fields=files(id,name,createdTime,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=50`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao listar formulários do Google Drive (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Gets details of a specific Google Form
 */
export async function getFormDetails(accessToken: string, formId: string): Promise<GoogleFormDetails> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao obter detalhes do formulário (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Gets responses to a specific Google Form
 */
export async function getFormResponses(accessToken: string, formId: string): Promise<GoogleFormResponsesList> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao obter respostas do formulário (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Creates a new Google Form
 */
export async function createGoogleForm(
  accessToken: string,
  title: string,
  documentTitle?: string
): Promise<GoogleFormDetails> {
  const url = 'https://forms.googleapis.com/v1/forms';
  const body = {
    info: {
      title,
      documentTitle: documentTitle || title
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao criar formulário (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Appends environmental survey questions to a created Google Form
 */
export async function addQuestionsToForm(
  accessToken: string,
  formId: string,
  description: string,
  questions: {
    title: string;
    description?: string;
    type: 'RADIO' | 'CHECKBOX' | 'TEXT' | 'PARAGRAPH';
    options?: string[];
    required?: boolean;
  }[]
): Promise<any> {
  const requests: any[] = [];

  // Update description first if present
  if (description) {
    requests.push({
      updateFormInfo: {
        info: {
          description
        },
        updateMask: 'description'
      }
    });
  }

  // Add questions
  questions.forEach((q, index) => {
    if (q.type === 'TEXT' || q.type === 'PARAGRAPH') {
      requests.push({
        createItem: {
          item: {
            title: q.title,
            description: q.description || '',
            questionItem: {
              question: {
                required: q.required !== false,
                textQuestion: {
                  paragraph: q.type === 'PARAGRAPH'
                }
              }
            }
          },
          location: {
            index
          }
        }
      });
    } else {
      requests.push({
        createItem: {
          item: {
            title: q.title,
            description: q.description || '',
            questionItem: {
              question: {
                required: q.required !== false,
                choiceQuestion: {
                  type: q.type,
                  options: (q.options || ['Sim', 'Não']).map((val) => ({ value: val }))
                }
              }
            }
          },
          location: {
            index
          }
        }
      });
    }
  });

  const url = `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao adicionar perguntas ao formulário (${res.status}): ${errorText}`);
  }

  return await res.json();
}
