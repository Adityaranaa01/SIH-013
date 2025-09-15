import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

interface ServicesSectionProps {
  onSectionChange: (section: string) => void;
}

export function ServicesSection({ onSectionChange }: ServicesSectionProps) {
  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl mb-6">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We offer a range of services focused on creating fast, accessible, and beautiful web experiences.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <h3 className="text-xl">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onSectionChange("contact")}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="py-12 bg-muted rounded-lg text-center">
        <h2 className="text-3xl mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Let's discuss your project and see how we can help you create something amazing.
        </p>
        <Button size="lg" onClick={() => onSectionChange("contact")}>
          Contact Us Today
        </Button>
      </section>
    </div>
  );
}