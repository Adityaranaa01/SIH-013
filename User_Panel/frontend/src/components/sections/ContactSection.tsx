import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";

export function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-3xl mb-6 text-gray-900">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Have questions about the Smart Transit System? Get in touch with our team for support, 
          partnerships, or technical inquiries.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <h2 className="text-xl text-gray-900">Send us a Message</h2>
            <p className="text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                  <Input id="firstName" placeholder="John" className="bg-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" className="bg-white" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-white" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                <Input id="subject" placeholder="Transit System Inquiry" className="bg-white" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your city's transport needs..." 
                  className="min-h-32 bg-white"
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-8">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <h2 className="text-xl text-gray-900">Get in Touch</h2>
              <p className="text-gray-600">
                Reach out through any of these channels for quick support.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">team.smarttransit@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Team Location</p>
                  <p className="text-gray-600">IIT Mumbai, Maharashtra</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg mb-4 text-gray-900">Smart India Hackathon 2024</h3>
              <p className="text-gray-600 mb-4">
                This project is part of Smart India Hackathon 2024. Connect with our team 
                for technical discussions and collaboration opportunities.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="bg-white border-gray-300">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="bg-white border-gray-300">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg mb-4 text-gray-900">For Cities & Transport Authorities</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Implementation support
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Custom integrations
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Training & documentation
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Ongoing maintenance
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}