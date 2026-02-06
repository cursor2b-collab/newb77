/**
 * 消息相关API
 */
import apiClient from './client';

export interface Message {
  id: number;
  title: string;
  content: string;
  is_read: number; // 0未读 1已读
  created_at: string;
  [key: string]: any;
}

export interface MessageListRequest {
  page?: number;
  limit?: number;
  type?: string; // 'receive' | 'send'
}

export interface MessageListResponse {
  code: number;
  message: string;
  data: {
    data: Message[];
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

export interface SendMessageRequest {
  title: string;
  content: string;
  pid?: number; // 回复的消息ID
}

export interface MessageResponse {
  code: number;
  message: string;
  data?: any;
}

// 获取消息列表
export const getMessageList = (params: MessageListRequest = {}): Promise<MessageListResponse> => {
  // 根据接口清单：POST /member/message/list
  return apiClient.post('/member/message/list', {
    page: params.page || 1,
    limit: params.limit || 20,
    type: params.type || 'receive'
  });
};

// 获取发送的消息列表
export const getSendMessageList = (params: MessageListRequest = {}): Promise<MessageListResponse> => {
  // 根据接口清单：POST /member/message/send_list
  return apiClient.post('/member/message/send_list', {
    page: params.page || 1,
    limit: params.limit || 20
  });
};

// 标记消息为已读
export const readMessage = (id: number): Promise<MessageResponse> => {
  // 根据接口清单：POST member/message/read
  return apiClient.post('member/message/read', { id });
};

// 删除消息
export const deleteMessage = (id: number): Promise<MessageResponse> => {
  // 根据接口清单：DELETE member/message/delete
  return apiClient.delete('member/message/delete', { data: { id } });
};

// 发送消息
export const sendMessage = (params: SendMessageRequest): Promise<MessageResponse> => {
  // 根据接口清单：POST /member/message/send 或 /member/message/send/{pid}
  const url = params.pid ? `/member/message/send/${params.pid}` : '/member/message/send';
  return apiClient.post(url, {
    title: params.title,
    content: params.content
  });
};

