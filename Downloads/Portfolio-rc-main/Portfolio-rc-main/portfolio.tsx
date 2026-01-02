"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Github, Linkedin, Mail, ExternalLink, Calendar, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Work {
  id: number
  title: string
  description: string
  image: string
  technologies: string[]
  github: string
  category: string
  fullDescription: string
  features: string[]
  prerequisites: string[]
  techStack?: Record<string, string>
}

interface Blog {
  id: number
  title: string
  excerpt: string
  date: string
  readTime: string
  tags: string[]
  image: string
  link: string
  content: string
}

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentView, setCurrentView] = useState("home")
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const works: Work[] = [
    {
      id: 1,
      title: "PDF Utility Application",
      description:
        "A comprehensive Python GUI application for PDF operations including merging, splitting, converting, and watermarking.",
      image: "/placeholder.svg?height=300&width=500",
      technologies: ["Python", "Tkinter", "PyPDF2", "PyMuPDF"],
      github: "https://github.com/Tharindu-akalanka/PDF-Utility",
      category: "Desktop Application",
      fullDescription: `This Python application provides a GUI-based utility for performing various operations on PDF files using tkinter for GUI and PyPDF2 for basic operations such as merging, splitting, and deleting pages, as well as PyMuPDF (fitz) for advanced operations like converting PDF to JPG, JPG to PDF, adding watermarks, and compressing PDFs.`,
      features: [
        "Merge PDFs: Combine multiple PDF files into one",
        "Split PDF: Divide a PDF into multiple parts",
        "Delete Pages from PDF: Remove selected pages from a PDF",
        "PDF to JPG: Convert PDF pages to JPG images",
        "Add Watermarks: Apply watermarks to PDF documents",
        "Compress PDFs: Reduce file size while maintaining quality",
      ],
      prerequisites: ["Python 3.x installed on your system", "Required Python packages (PyPDF2, PyMuPDF) installed"],
    },
    {
      id: 2,
      title: "GPA Calculator - Python Tkinter GUI",
      description:
        "A desktop GUI application built with Python and Tkinter for calculating semester GPA with modern UI design.",
      image: "/placeholder.svg?height=300&width=500",
      technologies: ["Python", "Tkinter", "Figma", "Tkinter Designer"],
      github: "https://github.com/Tharindu-akalanka/GPA_Calculator",
      category: "Desktop Application",
      fullDescription: `This is a desktop GUI application built with Python and Tkinter, designed to calculate semester GPA based on user input for course names, grades, and credit values. The UI was initially designed using Figma and converted to functional Python code using Tkinter Designer.`,
      features: [
        "Input up to 7 courses",
        "Select grades from dropdown (A to F)",
        "Input course credit values",
        "Real-time GPA calculation",
        "Individual clear buttons for each row",
        "Add new course rows dynamically",
        "Clean and responsive interface (based on Figma design)",
      ],
      prerequisites: ["Python 3.8+ installed", "Tkinter library (usually comes with Python)"],
      techStack: {
        Python: "Core programming language",
        Tkinter: "GUI library for Python",
        "Tkinter.ttk": "For dropdown (Combobox) widgets",
        Figma: "UI design",
        "Tkinter Designer": "Convert Figma designs to Tkinter layout code",
      },
    },
  ]

  const blogs: Blog[] = [
    {
      id: 1,
      title: "How to Build a Python GUI Without Writing Layout Code Using Figma and Tkinter Designer",
      excerpt:
        "Learn how to create modern Python GUI applications by designing in Figma and converting to Tkinter code automatically.",
      date: "2024-01-15",
      readTime: "8 min read",
      tags: ["Python", "GUI", "Figma", "Tkinter"],
      image: "/placeholder.svg?height=400&width=800",
      link: "https://medium.com/@tharinduakalanka930/how-to-build-a-python-gui-without-writing-layout-code-using-figma-and-tkinter-designer-f7f90820ca40",
      content: `
        <div class="blog-content">
          <h2>Introduction</h2>
          <p>Building GUI applications in Python traditionally requires writing extensive layout code, positioning elements manually, and dealing with complex geometry managers. However, with modern tools like Figma and Tkinter Designer, we can create beautiful interfaces visually and convert them to functional Python code automatically.</p>
          
          <div class="image-container">
            <img src="/placeholder.svg?height=300&width=600" alt="Figma to Tkinter Designer Workflow" class="blog-image" />
            <p class="image-caption">The workflow from Figma design to Python GUI application</p>
          </div>

          <h2>What is Tkinter Designer?</h2>
          <p>Tkinter Designer is an open-source tool created by ParthJadhav that allows developers to design GUI layouts using Figma's powerful design tools, and then export them directly to Tkinter Python code. This revolutionary approach saves countless hours of manual layout coding and allows for modern UI design with minimal programming effort.</p>

          <div class="image-container">
            <img src="/placeholder.svg?height=250&width=500" alt="Tkinter Designer Interface" class="blog-image" />
            <p class="image-caption">Tkinter Designer's clean and intuitive interface</p>
          </div>

          <h2>Why Use This Approach?</h2>
          <p>Traditional Tkinter development involves writing code like this:</p>
          
          <pre class="code-block">
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.geometry("400x300")
root.title("Traditional Approach")

label = tk.Label(root, text="Hello World", font=("Arial", 16))
label.place(x=150, y=100)

button = tk.Button(root, text="Click Me", command=lambda: print("Clicked!"))
button.place(x=160, y=150)

root.mainloop()
          </pre>

          <p>While this works, it becomes increasingly complex as your interface grows. With Figma and Tkinter Designer, you design visually and get clean, organized code automatically.</p>

          <div class="image-container">
            <img src="/placeholder.svg?height=300&width=700" alt="Before and After Comparison" class="blog-image" />
            <p class="image-caption">Comparison: Traditional coding vs. Visual design approach</p>
          </div>

          <h2>The Complete Process</h2>
          
          <h3>Step 1: Setting Up Figma</h3>
          <p>First, create a new Figma file and set up your canvas. The key is to use proper naming conventions for your elements:</p>
          <ul>
            <li>Use descriptive names for all elements</li>
            <li>Group related elements together</li>
            <li>Maintain consistent spacing and alignment</li>
          </ul>

          <div class="image-container">
            <img src="/placeholder.svg?height=400&width=600" alt="Figma Design Setup" class="blog-image" />
            <p class="image-caption">Setting up your Figma design with proper naming conventions</p>
          </div>

          <h3>Step 2: Designing Your Interface</h3>
          <p>Create your interface using Figma's powerful design tools. Focus on:</p>
          <ul>
            <li>Clean, modern aesthetics</li>
            <li>Proper color schemes</li>
            <li>Consistent typography</li>
            <li>Logical element hierarchy</li>
          </ul>

          <div class="image-container">
            <img src="/placeholder.svg?height=350&width=550" alt="Figma Design Process" class="blog-image" />
            <p class="image-caption">Designing a modern GPA calculator interface in Figma</p>
          </div>

          <h3>Step 3: Installing Tkinter Designer</h3>
          <p>Install Tkinter Designer using pip:</p>
          
          <pre class="code-block">
pip install tkinter-designer
          </pre>

          <p>Or clone the repository for the latest features:</p>
          
          <pre class="code-block">
git clone https://github.com/ParthJadhav/Tkinter-Designer.git
cd Tkinter-Designer
pip install -r requirements.txt
          </pre>

          <h3>Step 4: Exporting from Figma</h3>
          <p>To export your design:</p>
          <ol>
            <li>Get your Figma file URL</li>
            <li>Generate a Figma API token</li>
            <li>Run Tkinter Designer with your credentials</li>
            <li>Watch as your design becomes Python code!</li>
          </ol>

          <div class="image-container">
            <img src="/placeholder.svg?height=300&width=650" alt="Export Process" class="blog-image" />
            <p class="image-caption">The export process from Figma to Python code</p>
          </div>

          <h3>Step 5: Adding Functionality</h3>
          <p>Once you have your generated code, you can add the business logic:</p>
          
          <pre class="code-block">
def calculate_gpa():
    total_points = 0
    total_credits = 0
    
    for i in range(len(courses)):
        if courses[i].get() and grades[i].get() and credits[i].get():
            grade_point = grade_values[grades[i].get()]
            credit_value = float(credits[i].get())
            total_points += grade_point * credit_value
            total_credits += credit_value
    
    if total_credits > 0:
        gpa = total_points / total_credits
        gpa_label.config(text=f"GPA: {gpa:.2f}")
          </pre>

          <div class="image-container">
            <img src="/placeholder.svg?height=300&width=600" alt="Final Application" class="blog-image" />
            <p class="image-caption">The final GPA calculator application running</p>
          </div>

          <h2>Benefits of This Approach</h2>
          
          <h3>1. Visual Design Process</h3>
          <p>Design your interface visually using Figma's powerful tools, seeing exactly how it will look before writing any code.</p>

          <h3>2. Faster Development</h3>
          <p>Skip the tedious process of manually positioning elements and calculating coordinates.</p>

          <h3>3. Modern UI Aesthetics</h3>
          <p>Create interfaces that look modern and professional, not like typical Tkinter applications.</p>

          <h3>4. Reduced Manual Coding</h3>
          <p>Focus on functionality rather than layout code, making development more enjoyable and productive.</p>

          <h3>5. Easy Iterations</h3>
          <p>Make design changes in Figma and re-export, rather than modifying complex layout code.</p>

          <div class="image-container">
            <img src="/placeholder.svg?height=250&width=700" alt="Benefits Overview" class="blog-image" />
            <p class="image-caption">Key benefits of using Figma with Tkinter Designer</p>
          </div>

          <h2>Best Practices</h2>
          
          <h3>Figma Design Tips</h3>
          <ul>
            <li>Use consistent naming conventions</li>
            <li>Group related elements</li>
            <li>Maintain proper layer hierarchy</li>
            <li>Use constraints for responsive design</li>
          </ul>

          <h3>Code Organization</h3>
          <ul>
            <li>Separate generated code from business logic</li>
            <li>Use classes to organize your application</li>
            <li>Implement proper error handling</li>
            <li>Add comments for future maintenance</li>
          </ul>

          <h2>Common Challenges and Solutions</h2>
          
          <h3>Challenge 1: Complex Layouts</h3>
          <p>Solution: Break complex designs into smaller, manageable components in Figma.</p>

          <h3>Challenge 2: Custom Widgets</h3>
          <p>Solution: Use Figma's component system to create reusable elements.</p>

          <h3>Challenge 3: Responsive Design</h3>
          <p>Solution: Use Figma's auto-layout and constraints features.</p>

          <div class="image-container">
            <img src="/placeholder.svg?height=300&width=600" alt="Challenges and Solutions" class="blog-image" />
            <p class="image-caption">Common challenges and their solutions</p>
          </div>

          <h2>Real-World Example: GPA Calculator</h2>
          <p>I used this exact process to create a GPA calculator application. The entire UI was designed in Figma and converted to Python code using Tkinter Designer. The result was a modern, professional-looking application that would have taken hours to code manually.</p>

          <div class="image-container">
            <img src="/placeholder.svg?height=400&width=700" alt="GPA Calculator Example" class="blog-image" />
            <p class="image-caption">The complete GPA calculator built using this workflow</p>
          </div>

          <h2>Future Possibilities</h2>
          <p>This approach opens up exciting possibilities:</p>
          <ul>
            <li>Rapid prototyping of desktop applications</li>
            <li>Designer-developer collaboration</li>
            <li>Modern UI/UX in Python applications</li>
            <li>Faster time-to-market for desktop software</li>
          </ul>

          <h2>Conclusion</h2>
          <p>The combination of Figma and Tkinter Designer represents a paradigm shift in Python GUI development. By leveraging visual design tools, we can create better-looking applications faster and with less code. This approach is particularly valuable for developers who want to focus on functionality rather than spending time on layout details.</p>

          <p>Whether you're building a simple utility or a complex desktop application, this workflow can significantly improve your development experience and the quality of your final product.</p>

          <div class="image-container">
            <img src="/placeholder.svg?height=200&width=600" alt="Conclusion" class="blog-image" />
            <p class="image-caption">The future of Python GUI development is visual</p>
          </div>

          <h2>Resources and Next Steps</h2>
          <ul>
            <li><a href="https://github.com/ParthJadhav/Tkinter-Designer" target="_blank">Tkinter Designer GitHub Repository</a></li>
            <li><a href="https://www.figma.com/" target="_blank">Figma Official Website</a></li>
            <li><a href="https://docs.python.org/3/library/tkinter.html" target="_blank">Python Tkinter Documentation</a></li>
          </ul>

          <p>Try this approach in your next Python GUI project and experience the difference it makes in your development workflow!</p>
        </div>

        <style>
          .blog-content {
            line-height: 1.8;
            color: #e5e7eb;
          }
          
          .blog-content h2 {
            color: #ffffff;
            font-size: 1.5rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 0.5rem;
          }
          
          .blog-content h3 {
            color: #f3f4f6;
            font-size: 1.25rem;
            font-weight: 500;
            margin: 1.5rem 0 0.75rem 0;
          }
          
          .blog-content p {
            margin-bottom: 1rem;
            color: #d1d5db;
          }
          
          .blog-content ul, .blog-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: #d1d5db;
          }
          
          .blog-content li {
            margin-bottom: 0.5rem;
          }
          
          .image-container {
            margin: 2rem 0;
            text-align: center;
          }
          
          .blog-image {
            width: 100%;
            max-width: 700px;
            height: auto;
            border-radius: 8px;
            border: 1px solid #374151;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .image-caption {
            font-size: 0.875rem;
            color: #9ca3af;
            margin-top: 0.5rem;
            font-style: italic;
          }
          
          .code-block {
            background: #1f2937;
            border: 1px solid #374151;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            color: #e5e7eb;
          }
          
          .blog-content a {
            color: #60a5fa;
            text-decoration: underline;
          }
          
          .blog-content a:hover {
            color: #93c5fd;
          }
        </style>
      `,
    },
  ]

  const showWork = (work: Work) => {
    setSelectedWork(work)
    setCurrentView("work-detail")
  }

  const showBlog = (blog: Blog) => {
    setSelectedBlog(blog)
    setCurrentView("blog-detail")
  }

  const goHome = () => {
    setCurrentView("home")
    setSelectedWork(null)
    setSelectedBlog(null)
  }

  if (currentView === "work-detail" && selectedWork) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Modern Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

          {/* Animated Geometric Patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 border border-blue-500/30 rotate-45 floating-shape"></div>
            <div
              className="absolute top-1/4 right-20 w-24 h-24 border border-purple-500/30 rotate-12 floating-shape"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-1/4 w-40 h-40 border border-green-500/20 rounded-full floating-dot"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          {/* Flowing Lines */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1000 1000">
              <path
                d="M0,300 Q250,100 500,300 T1000,300"
                stroke="url(#gradient1)"
                strokeWidth="2"
                fill="none"
                className="animated-path"
              />
              <path
                d="M0,600 Q250,800 500,600 T1000,600"
                stroke="url(#gradient2)"
                strokeWidth="2"
                fill="none"
                className="animated-path-reverse"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Button onClick={goHome} variant="outline" className="mb-8 border-gray-700 text-gray-300 hover:bg-gray-800">
              ← Back to Portfolio
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div>
                <Image
                  src={selectedWork.image || "/placeholder.svg"}
                  alt={selectedWork.title}
                  width={500}
                  height={300}
                  className="rounded-lg border border-gray-800 shadow-2xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-sm rounded-full border border-blue-800">
                    {selectedWork.category}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">{selectedWork.title}</h1>
                <p className="text-gray-300 text-lg mb-6">{selectedWork.fullDescription}</p>

                <div className="flex gap-4 mb-8">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href={selectedWork.github} target="_blank">
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedWork.technologies?.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                    >
                      {tech}
                    </span>
                  )) || null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border border-gray-800 bg-black/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedWork.features?.map((feature, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {feature}
                      </li>
                    )) || null}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-800 bg-black/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedWork.prerequisites?.map((prereq, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {prereq}
                      </li>
                    )) || null}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {selectedWork.techStack && (
              <Card className="border border-gray-800 bg-black/50 backdrop-blur-md mt-8">
                <CardHeader>
                  <CardTitle className="text-white">Tech Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedWork.techStack).map(([tech, purpose], index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <span className="text-blue-400 font-medium">{tech}</span>
                        <span className="text-gray-300 text-sm">{purpose}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "blog-detail" && selectedBlog) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Modern Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

          {/* Animated Particles */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Button onClick={goHome} variant="outline" className="mb-8 border-gray-700 text-gray-300 hover:bg-gray-800">
              ← Back to Portfolio
            </Button>

            <article className="prose prose-invert max-w-none">
              <Image
                src={selectedBlog.image || "/placeholder.svg"}
                alt={selectedBlog.title}
                width={800}
                height={400}
                className="rounded-lg border border-gray-800 shadow-2xl mb-8"
              />

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(selectedBlog.date).toLocaleDateString()}
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{selectedBlog.readTime}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedBlog.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-900/50 text-blue-300 text-sm rounded-full border border-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1 inline" />
                    {tag}
                  </span>
                )) || null}
              </div>

              <h1 className="text-4xl font-bold text-white mb-6">{selectedBlog.title}</h1>

              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />

              <div className="mt-12 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 className="text-white text-lg font-semibold mb-4">Read the full article</h3>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href={selectedBlog.link} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Medium
                  </Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Modern Dark Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          ></div>
          <div
            className="absolute top-1/4 right-0 w-96 h-96 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"
            style={{ transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.1}deg)` }}
          ></div>
          <div
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_50%)]"
            style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0001})` }}
          ></div>
        </div>

        {/* Animated Grid Pattern with Perspective */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"
            style={{
              transform: `translateY(${scrollY * 0.1}px) perspective(1000px) rotateX(${scrollY * 0.01}deg)`,
              transformOrigin: "center center",
            }}
          ></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-16 h-16 border-2 border-blue-500/40 rotate-45 floating-shape"></div>
          <div
            className="absolute top-1/3 right-32 w-12 h-12 border-2 border-purple-500/40 rounded-full floating-shape"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-20 h-20 border-2 border-green-500/30 rotate-12 floating-shape"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-8 h-8 bg-blue-500/20 rounded-full floating-dot"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-purple-500/20 rounded-full floating-dot"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        {/* Animated Lines */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <path
              d="M0,200 Q250,50 500,200 T1000,200"
              stroke="url(#gradient1)"
              strokeWidth="1"
              fill="none"
              className="animated-path"
            />
            <path
              d="M0,400 Q250,550 500,400 T1000,400"
              stroke="url(#gradient2)"
              strokeWidth="1"
              fill="none"
              className="animated-path-reverse"
            />
            <path
              d="M0,700 Q250,850 500,700 T1000,700"
              stroke="url(#gradient3)"
              strokeWidth="1"
              fill="none"
              className="animated-path"
              style={{ animationDelay: "2s" }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md border border-gray-700 rounded-full px-4 py-2 shadow-2xl">
          <Link
            href="#home"
            className="text-white hover:text-blue-400 px-3 py-1.5 text-sm font-medium transition-colors rounded-full hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href="#about"
            className="text-gray-300 hover:text-blue-400 px-3 py-1.5 text-sm font-medium transition-colors rounded-full hover:bg-white/10"
          >
            About Me
          </Link>
          <Link
            href="#works"
            className="text-gray-300 hover:text-blue-400 px-3 py-1.5 text-sm font-medium transition-colors rounded-full hover:bg-white/10"
          >
            Works
          </Link>
          <Link
            href="#blog"
            className="text-gray-300 hover:text-blue-400 px-3 py-1.5 text-sm font-medium transition-colors rounded-full hover:bg-white/10"
          >
            Blog
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Tharindu Akalanka</h1>
            <div className="text-xl md:text-2xl text-gray-300 mb-8 h-8 flex items-center justify-center">
              <span>BICT Undergraduate | </span>
              <div className="ml-2 relative inline-block min-w-[200px] text-left">
                <span className="typewriter-text text-blue-400"></span>
                <span className="typewriter-cursor">|</span>
              </div>
            </div>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Passionate BICT student at Faculty of Technology, University of Sri Jayawardenapura. Creating innovative
              solutions and building amazing digital experiences with cutting-edge technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 border-0"
              >
                <Link href="#works">View My Work</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
              >
                <Link href="#contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">About Me</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/images/profile.jpg"
                alt="Tharindu Akalanka - BICT Student"
                width={400}
                height={400}
                className="rounded-2xl shadow-2xl mx-auto border border-gray-800"
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">Hello! I'm Tharindu Akalanka</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                I'm a passionate BICT (Bachelor of Information and Communication Technology) undergraduate student at
                the Faculty of Technology, University of Sri Jayawardenapura. My journey in technology is driven by
                curiosity and a deep passion for creating innovative solutions that make a real difference.
              </p>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Currently pursuing my degree while actively working on various projects that challenge my skills and
                expand my knowledge in software development, web technologies, and emerging tech trends. I enjoy working
                with modern technologies like Python, React, Node.js, and exploring new frameworks and tools.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Frontend</h4>
                  <p className="text-gray-400 text-sm">React, Next.js, TypeScript, Tailwind CSS</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Backend</h4>
                  <p className="text-gray-400 text-sm">Node.js, Python, Express, MongoDB</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Desktop Apps</h4>
                  <p className="text-gray-400 text-sm">Python Tkinter, GUI Development</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Design</h4>
                  <p className="text-gray-400 text-sm">Figma, UI/UX Design, Prototyping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Works Section */}
      <section id="works" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">My Works</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Here are some of my recent projects that showcase my skills and passion for development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {works.map((work) => (
              <Card
                key={work.id}
                className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-800 bg-black/40 backdrop-blur-md"
              >
                <CardHeader className="p-0">
                  <Image
                    src={work.image || "/placeholder.svg"}
                    alt={work.title}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover rounded-t-lg border-b border-gray-800"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded border border-blue-800">
                      {work.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl mb-2 text-white group-hover:text-blue-400 transition-colors">
                    {work.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 mb-4">{work.description}</CardDescription>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {work.technologies.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                      {work.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
                          +{work.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => showWork(work)} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                      View Details
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Link href={work.github} target="_blank">
                        <Github className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">BLOG POSTS</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Weekly topics cover tech trends, software development, and productivity. Beyond grammar fixes, the aim is
              knowledge expansion and writing refinement. Quality over quantity is prioritized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {blogs.map((blog) => (
              <Card
                key={blog.id}
                className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-800 bg-black/40 backdrop-blur-md"
              >
                <CardHeader className="p-0">
                  <Image
                    src={blog.image || "/placeholder.svg"}
                    alt={blog.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg border-b border-gray-800"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(blog.date).toLocaleDateString()}
                    </div>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <CardTitle className="text-xl mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {blog.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 mb-4 line-clamp-3">{blog.excerpt}</CardDescription>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded border border-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => showBlog(blog)} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                      Read More
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Link href={blog.link} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Get In Touch</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? I'd love to hear from you. Let's create something amazing
              together!
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border border-gray-800 shadow-2xl shadow-blue-500/10 bg-black/40 backdrop-blur-md">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your Name"
                        className="w-full bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="w-full bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about your project or just say hello!"
                      rows={6}
                      className="w-full bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                    size="lg"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Tharindu Akalanka</h3>
            <p className="text-gray-400 mb-8">©2025 Tharindu Akalanka.</p>

            <div className="flex justify-center space-x-6 mb-8">
              <Link
                href="https://github.com/Tharindu-akalanka"
                className="text-gray-400 hover:text-white transition-colors hover:shadow-lg hover:shadow-white/10 p-2 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://www.linkedin.com/in/tharindu-akalanka-59ab46323/"
                className="text-gray-400 hover:text-white transition-colors hover:shadow-lg hover:shadow-white/10 p-2 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="mailto:tharinduakalanka930@gmail.com"
                className="text-gray-400 hover:text-white transition-colors hover:shadow-lg hover:shadow-white/10 p-2 rounded-full"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400 text-sm">Built with ❤️ using Next.js and Tailwind CSS</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Typewriter Animation */
        .typewriter-text::before {
          content: '';
          animation: typewriter 10s infinite;
        }
        
        .typewriter-cursor {
          animation: blink 1s infinite;
          color: #60a5fa;
        }
        
        @keyframes typewriter {
          0% { content: ''; }
          2% { content: 'S'; }
          4% { content: 'So'; }
          6% { content: 'Sof'; }
          8% { content: 'Soft'; }
          10% { content: 'Softw'; }
          12% { content: 'Softwa'; }
          14% { content: 'Softwar'; }
          16% { content: 'Software'; }
          18% { content: 'Software '; }
          20% { content: 'Software D'; }
          22% { content: 'Software De'; }
          24% { content: 'Software Dev'; }
          26% { content: 'Software Deve'; }
          28% { content: 'Software Devel'; }
          30% { content: 'Software Develo'; }
          32% { content: 'Software Develop'; }
          34% { content: 'Software Develope'; }
          36% { content: 'Software Developer'; }
          36%, 44% { content: 'Software Developer'; }
          46% { content: 'Software Develope'; }
          47% { content: 'Software Develop'; }
          48% { content: 'Software Develo'; }
          49% { content: 'Software Devel'; }
          50% { content: 'Software Deve'; }
          51% { content: 'Software Dev'; }
          52% { content: 'Software De'; }
          53% { content: 'Software D'; }
          54% { content: 'Software '; }
          55% { content: 'Software'; }
          56% { content: 'Softwar'; }
          57% { content: 'Softwa'; }
          58% { content: 'Softw'; }
          59% { content: 'Soft'; }
          60% { content: 'Sof'; }
          61% { content: 'So'; }
          62% { content: 'S'; }
          63% { content: ''; }
          65% { content: 'D'; }
          67% { content: 'De'; }
          69% { content: 'Des'; }
          71% { content: 'Desi'; }
          73% { content: 'Desig'; }
          75% { content: 'Design'; }
          77% { content: 'Designe'; }
          79% { content: 'Designer'; }
          79%, 87% { content: 'Designer'; }
          89% { content: 'Designe'; }
          90% { content: 'Design'; }
          91% { content: 'Desig'; }
          92% { content: 'Desi'; }
          93% { content: 'Des'; }
          94% { content: 'De'; }
          95% { content: 'D'; }
          96% { content: ''; }
          96%, 100% { content: ''; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Floating Animations */
        .floating-shape {
          animation: float 6s ease-in-out infinite;
        }

        .floating-dot {
          animation: float-dot 4s ease-in-out infinite;
        }

        .particle {
          animation: particle 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.6;
          }
        }

        @keyframes float-dot {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-15px) scale(1.2); 
            opacity: 0.8;
          }
        }

        @keyframes particle {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-30px) scale(1.2);
            opacity: 0.8;
          }
        }

        /* Animated Paths */
        .animated-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 8s ease-in-out infinite;
        }

        .animated-path-reverse {
          stroke-dasharray: 1000;
          stroke-dashoffset: -1000;
          animation: draw-reverse 10s ease-in-out infinite;
        }

        @keyframes draw {
          0%, 100% { stroke-dashoffset: 1000; }
          50% { stroke-dashoffset: 0; }
        }

        @keyframes draw-reverse {
          0%, 100% { stroke-dashoffset: -1000; }
          50% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
