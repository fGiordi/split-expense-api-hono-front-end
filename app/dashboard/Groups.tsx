"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { Group } from "@/types";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

const Spinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  const userId = getCookie("userId");
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const token = getCookie("token");
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}groups`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroups(response.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast.error("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    try {
      setIsCreatingGroup(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}groups`,
        { name: newGroupName, userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Group created successfully");
      setNewGroupName("");
      fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      toast.error("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast.error("Please select a group first");
      return;
    }

    const token = getCookie("token");
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    try {
      setIsSendingInvite(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}groups/${selectedGroupId}/invite`,
        { email: inviteEmail },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Invitation sent successfully");
      setInvitationToken(response.data.invitationToken);
      setInviteEmail("");
    } catch (err) {
      console.error("Error sending invitation:", err);
      toast.error("Failed to send invitation");
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-100">
            Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Group Form */}
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="groupName"
                className="text-green-100/80 text-sm font-medium"
              >
                Create New Group
              </Label>
              <div className="flex gap-2">
                <Input
                  id="groupName"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                  placeholder="Enter group name"
                  required
                />
                <Button
                  type="submit"
                  disabled={isCreatingGroup}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:opacity-50"
                >
                  {isCreatingGroup ? <Spinner /> : "Create Group"}
                </Button>
              </div>
            </div>
          </form>

          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="inviteEmail"
                className="text-green-100/80 text-sm font-medium"
              >
                Invite User to Group
              </Label>
              <div className="flex gap-2">
                <select
                  value={selectedGroupId || ""}
                  onChange={(e) => {
                    setSelectedGroupId(
                      e.target.value ? Number(e.target.value) : null
                    );
                  }}
                  className="bg-white/5 border-green-500/30 text-green-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2 w-40"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map((obj, index) => (
                    <option
                      className="text-black bg-red"
                      key={index}
                      value={obj.group.id}
                    >
                      {obj.group.name}
                    </option>
                  ))}
                </select>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                  placeholder="Enter email address"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSendingInvite}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:opacity-50"
                >
                  {isSendingInvite ? <Spinner /> : "Send Invite"}
                </Button>
              </div>
            </div>
          </form>

          {/* Groups List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-100">
              Your Groups
            </h3>
            {isLoading ? (
              <Spinner />
            ) : groups.length === 0 ? (
              <p className="text-green-200/70">
                You haven't created any groups yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((obj, index) => (
                  <Card key={index} className="bg-white/5 border-green-500/20">
                    <CardContent className="p-4">
                      <h4 className="text-green-100 font-semibold">
                        {obj.group.name}
                      </h4>
                      <p className="text-green-200/70 text-sm">
                        Created: {new Date(obj.group.createdAt).toUTCString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!invitationToken}
        onOpenChange={() => setInvitationToken(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-200">
              Invitation Sent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-green-200">
              An invitation has been sent to {inviteEmail}
            </p>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Invitation Token:</p>
              <p className="text-white font-mono break-all">
                {invitationToken}
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Share this token with the invited user to join the group.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
