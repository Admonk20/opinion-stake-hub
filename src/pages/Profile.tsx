import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Globe, Edit } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  verified: boolean;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    country: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await loadProfile(user.id);
    }
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || "",
          display_name: data.display_name || "",
          bio: data.bio || "",
          country: data.country || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          username: formData.username || null,
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          country: formData.country || null,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
      await loadProfile(user.id);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return user?.email?.split('@')[0] || "Anonymous User";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your profile.
            </p>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{getDisplayName()}</CardTitle>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {profile?.verified && (
                <div className="flex items-center justify-center gap-1 text-primary">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Verified User</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editing) {
                      setFormData({
                        username: profile?.username || "",
                        display_name: profile?.display_name || "",
                        bio: profile?.bio || "",
                        country: profile?.country || "",
                      });
                    }
                    setEditing(!editing);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter your username"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Enter your display name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Enter your country"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="mt-1">{profile?.username || "Not set"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                    <p className="mt-1">{profile?.display_name || "Not set"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="mt-1">{profile?.bio || "No bio provided"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.country || "Not set"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="mt-1">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {!editing && (
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to="/portfolio">View Portfolio</Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/trading-history">Trading History</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;