import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { Group, GroupMessage, CreateGroupPayload } from '../types/groups';

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    const { data } = await apiClient.get(endpoints.groups.list);
    return data.data;
  },

  async createGroup(payload: CreateGroupPayload): Promise<Group> {
    const { data } = await apiClient.post(endpoints.groups.create, payload);
    return data.data;
  },

  async getInvitePreview(code: string): Promise<Group & { isMember: boolean }> {
    const { data } = await apiClient.get(endpoints.groups.invitePreview(code));
    return data.data;
  },

  async joinGroup(code: string): Promise<Group> {
    const { data } = await apiClient.post(endpoints.groups.join(code));
    return data.data;
  },

  async addMember(groupId: string, username: string): Promise<void> {
    await apiClient.post(endpoints.groups.addMember(groupId), { username });
  },

  async getInvites(): Promise<any[]> {
    const { data } = await apiClient.get(endpoints.groups.getInvites);
    return data.data;
  },

  async acceptInvite(inviteId: string): Promise<Group> {
    const { data } = await apiClient.post(endpoints.groups.acceptInvite(inviteId));
    return data.data;
  },

  async declineInvite(inviteId: string): Promise<void> {
    await apiClient.post(endpoints.groups.declineInvite(inviteId));
  },

  async getMessages(groupId: string): Promise<GroupMessage[]> {
    const { data } = await apiClient.get(endpoints.groups.messages(groupId));
    return data.data;
  },

  async getGroupInfo(groupId: string): Promise<any> {
    const { data } = await apiClient.get(endpoints.groups.info(groupId));
    return data.data;
  },

  async leaveGroup(groupId: string): Promise<void> {
    await apiClient.post(endpoints.groups.leave(groupId));
  },

  async deleteGroup(groupId: string): Promise<void> {
    await apiClient.delete(endpoints.groups.delete(groupId));
  },
};
