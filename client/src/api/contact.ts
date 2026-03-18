import { apiPost } from './client'

export interface ContactRequest {
  firstName: string
  lastName: string
  email: string
  companyOrProject: string
  message: string
  source?: string
}

export interface ContactResponse {
  message: string
}

export const contactApi = {
  submit: (data: ContactRequest) =>
    apiPost<ContactResponse>('/api/contact', {
      ...data,
      source: data.source ?? 'portfolio-contact',
    }),
}
