import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, MessageSquare, Briefcase, Heart, Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">Alumni Connect</h1>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Connect Your College
            <span className="text-primary"> Community</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Bridge the gap between students and alumni. Share experiences, get advice, 
            find opportunities, and build lasting connections within your college community.
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="mr-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>College-Specific Communities</CardTitle>
              <CardDescription>
                Each college gets its own dedicated space for meaningful interactions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-student mb-2" />
              <CardTitle>Role-Based Profiles</CardTitle>
              <CardDescription>
                Distinct student and alumni profiles with batch and department info
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="h-10 w-10 text-alumni mb-2" />
              <CardTitle>Job Opportunities</CardTitle>
              <CardDescription>
                Alumni can share internships and job openings with students
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-red-500 mb-2" />
              <CardTitle>Share Memories</CardTitle>
              <CardDescription>
                Celebrate achievements and share nostalgic moments from college life
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-amber-500 mb-2" />
              <CardTitle>Events & Meetups</CardTitle>
              <CardDescription>
                Stay updated on alumni events, webinars, and networking sessions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-indigo-500 mb-2" />
              <CardTitle>Mentorship</CardTitle>
              <CardDescription>
                Connect students with alumni mentors for career guidance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Connect Your College Community?
              </h2>
              <p className="text-gray-600 mb-6">
                Join thousands of students and alumni already networking on Alumni Connect
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign Up Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
