using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Text.Json;

class Program
{

    class ConflictEntry
    {
        public string Type { get; set; } = "method";
        public string Class { get; set; }
        public string Method { get; set; }
        public string File1Body { get; set; }
        public string File2Body { get; set; }
    }
    static void Main(string[] args)
    {
        if (args.Length != 2)
        {
            Console.WriteLine("Usage: roslyn_merger <file1.cs> <file2.cs>");
            return;
        }

        string code1 = File.ReadAllText(args[0]);
        string code2 = File.ReadAllText(args[1]);

        var tree1 = CSharpSyntaxTree.ParseText(code1);
        var tree2 = CSharpSyntaxTree.ParseText(code2);

        var root1 = tree1.GetCompilationUnitRoot();
        var root2 = tree2.GetCompilationUnitRoot();

        var mergedRoot = root1;
        var conflicts = new List<ConflictEntry>();

        // Track existing class names and method bodies
        var classDict1 = GetClassesWithMethods(root1);
        var classDict2 = GetClassesWithMethods(root2);

        foreach (var kvp in classDict2)
        {
            string className = kvp.Key;
            var classNode2 = kvp.Value;
            if (classDict1.TryGetValue(className, out var classNode1))
            {
                var updatedClass = classNode1;

                var methodDict1 = classNode1.Members
                    .OfType<MethodDeclarationSyntax>()
                    .ToDictionary(m => m.Identifier.Text + m.ParameterList.ToFullString());

                foreach (var method2 in classNode2.Members.OfType<MethodDeclarationSyntax>())
                {
                    string signature = method2.Identifier.Text + method2.ParameterList.ToFullString();

                    if (methodDict1.TryGetValue(signature, out var method1))
                    {
                        // Compare bodies
                        if (method1.Body?.ToFullString().Trim() != method2.Body?.ToFullString().Trim())
                        {
                            conflicts.Add(new ConflictEntry
                            {
                                Class = className,
                                Method = method2.Identifier.Text,
                                File1Body = method1.Body?.ToFullString()?.Trim(),
                                File2Body = method2.Body?.ToFullString()?.Trim()
                            });
                        }
                        // else, identical: skip
                    }
                    else
                    {
                        updatedClass = updatedClass.AddMembers(method2);
                    }
                }

                mergedRoot = ReplaceClass(mergedRoot, classNode1, updatedClass);
            }
            else
            {
                // New class from file2
                mergedRoot = mergedRoot.AddMembers(classNode2);
            }
        }

        Console.WriteLine(mergedRoot.NormalizeWhitespace().ToFullString());

        // Emit separator + JSON conflict log to stderr
        Console.Error.WriteLine("===MERGEAI_CONFLICTS_START===");
        Console.Error.WriteLine(JsonSerializer.Serialize(conflicts, new JsonSerializerOptions { WriteIndented = true }));
        Console.Error.WriteLine("===MERGEAI_CONFLICTS_END===");
    }

    static Dictionary<string, ClassDeclarationSyntax> GetClassesWithMethods(CompilationUnitSyntax root)
    {
        var result = new Dictionary<string, ClassDeclarationSyntax>();

        foreach (var ns in root.Members.OfType<NamespaceDeclarationSyntax>())
        {
            foreach (var cls in ns.Members.OfType<ClassDeclarationSyntax>())
            {
                string fullName = ns.Name.ToString() + "." + cls.Identifier.Text;
                result[fullName] = cls;
            }
        }

        foreach (var cls in root.Members.OfType<ClassDeclarationSyntax>())
        {
            result[cls.Identifier.Text] = cls;
        }

        return result;
    }

    static CompilationUnitSyntax ReplaceClass(CompilationUnitSyntax root, ClassDeclarationSyntax oldClass, ClassDeclarationSyntax newClass)
    {
        return root.ReplaceNode(oldClass, newClass);
    }

}