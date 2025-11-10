#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

/**
 * License Checker CLI
 * Verifies if a project's license matches OSI-approved licenses
 */

interface OSILicense {
  name: string;
  id: string;
  keywords: string[];
  url: string;
}

// OSI-Approved Licenses (Popular ones)
const OSI_LICENSES: OSILicense[] = [
  {
    name: 'MIT License',
    id: 'MIT',
    keywords: ['MIT License', 'Permission is hereby granted', 'free of charge'],
    url: 'https://opensource.org/licenses/MIT'
  },
  {
    name: 'Apache License 2.0',
    id: 'Apache-2.0',
    keywords: ['Apache License', 'Version 2.0', 'Licensed under the Apache License'],
    url: 'https://opensource.org/licenses/Apache-2.0'
  },
  {
    name: 'BSD 3-Clause License',
    id: 'BSD-3-Clause',
    keywords: ['BSD 3-Clause', 'Redistribution and use in source and binary forms', 'Neither the name'],
    url: 'https://opensource.org/licenses/BSD-3-Clause'
  },
  {
    name: 'BSD 2-Clause License',
    id: 'BSD-2-Clause',
    keywords: ['BSD 2-Clause', 'Redistribution and use in source and binary forms', 'THIS SOFTWARE IS PROVIDED'],
    url: 'https://opensource.org/licenses/BSD-2-Clause'
  },
  {
    name: 'GNU GPL v3',
    id: 'GPL-3.0',
    keywords: ['GNU GENERAL PUBLIC LICENSE', 'Version 3', 'Free Software Foundation'],
    url: 'https://opensource.org/licenses/GPL-3.0'
  },
  {
    name: 'GNU GPL v2',
    id: 'GPL-2.0',
    keywords: ['GNU GENERAL PUBLIC LICENSE', 'Version 2', 'Free Software Foundation'],
    url: 'https://opensource.org/licenses/GPL-2.0'
  },
  {
    name: 'GNU LGPL v3',
    id: 'LGPL-3.0',
    keywords: ['GNU LESSER GENERAL PUBLIC LICENSE', 'Version 3'],
    url: 'https://opensource.org/licenses/LGPL-3.0'
  },
  {
    name: 'Mozilla Public License 2.0',
    id: 'MPL-2.0',
    keywords: ['Mozilla Public License', 'Version 2.0'],
    url: 'https://opensource.org/licenses/MPL-2.0'
  },
  {
    name: 'ISC License',
    id: 'ISC',
    keywords: ['ISC License', 'Permission to use, copy, modify'],
    url: 'https://opensource.org/licenses/ISC'
  },
  {
    name: 'Eclipse Public License 2.0',
    id: 'EPL-2.0',
    keywords: ['Eclipse Public License', 'Version 2.0'],
    url: 'https://opensource.org/licenses/EPL-2.0'
  },
  {
    name: 'Artistic License 2.0',
    id: 'Artistic-2.0',
    keywords: ['Artistic License 2.0', 'Copyright (c)'],
    url: 'https://opensource.org/licenses/Artistic-2.0'
  },
  {
    name: 'Unlicense',
    id: 'Unlicense',
    keywords: ['This is free and unencumbered software', 'public domain'],
    url: 'https://opensource.org/licenses/Unlicense'
  }
];

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    📜 OSI License Checker                                   ║
║                                                                              ║
║              Verify Your License Against OSI Standards                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  const input = args[0] || '.';

  // Check if input is a GitHub URL
  const githubMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  
  if (githubMatch) {
    await checkGitHubRepo(githubMatch[1], githubMatch[2]);
  } else {
    await checkLocalProject(input);
  }
}

async function checkGitHubRepo(owner: string, repo: string) {
  console.log(`🔍 Checking GitHub repository: ${owner}/${repo}\n`);

  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.log('⚠️  No GitHub token found. Using unauthenticated requests (rate limited).\n');
    console.log('💡 Set GITHUB_TOKEN for better rate limits:\n');
    console.log('   export GITHUB_TOKEN=your_token\n');
  }

  try {
    // Fetch repository info
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'License-Checker-CLI'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    const repoResponse = await fetch(repoUrl, { headers });
    
    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                        📦 REPOSITORY INFO');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log(`📦 Repository: ${repoData.full_name}`);
    console.log(`📝 Description: ${repoData.description || 'No description'}`);
    console.log(`⭐ Stars: ${repoData.stargazers_count.toLocaleString()}`);
    console.log(`🍴 Forks: ${repoData.forks_count.toLocaleString()}`);
    console.log(`👀 Watchers: ${repoData.watchers_count.toLocaleString()}\n`);

    // Fetch license info
    const licenseUrl = `https://api.github.com/repos/${owner}/${repo}/license`;
    const licenseResponse = await fetch(licenseUrl, { headers });

    if (!licenseResponse.ok) {
      console.log('❌ No license found in this repository!\n');
      console.log('⚠️  WARNING: Using code without a license can lead to legal issues!\n');
      console.log('💡 Recommendations:\n');
      console.log('   • Contact the repository owner');
      console.log('   • Request them to add a license');
      console.log('   • Do NOT use this code in production without permission\n');
      return;
    }

    const licenseData = await licenseResponse.json();

    // Decode license content (it's base64 encoded)
    const licenseContent = Buffer.from(licenseData.content, 'base64').toString('utf-8');

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                        ✅ LICENSE DETECTED');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log(`📜 License Name: ${licenseData.license.name}`);
    console.log(`🆔 License ID: ${licenseData.license.spdx_id}`);
    console.log(`🔗 License URL: ${licenseData.license.url}`);
    console.log(`📄 License File: ${licenseData.name}`);
    console.log(`🔗 View on GitHub: ${licenseData.html_url}\n`);

    // Check if OSI approved
    const osiLicense = OSI_LICENSES.find(l => 
      l.id === licenseData.license.spdx_id || 
      l.name.toLowerCase() === licenseData.license.name.toLowerCase()
    );

    if (osiLicense) {
      console.log('✅ Status: OSI-Approved ✓\n');
      displayLicenseCharacteristics(osiLicense.id);
    } else {
      console.log('⚠️  Status: Not in OSI-approved list (may still be valid)\n');
    }

    // Display usage guidelines
    displayUsageGuidelines(licenseData.license.spdx_id, repoData.full_name);

    // Show license content preview
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                        📄 LICENSE CONTENT PREVIEW');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    const lines = licenseContent.split('\n').slice(0, 10);
    lines.forEach(line => console.log(`   ${line}`));
    if (licenseContent.split('\n').length > 10) {
      console.log(`   ... (${licenseContent.split('\n').length - 10} more lines)`);
    }
    console.log();

  } catch (error: any) {
    console.error('❌ Error fetching GitHub repository:', error.message);
    console.log('\n💡 Make sure the repository exists and is public.\n');
    process.exit(1);
  }
}

async function checkLocalProject(projectPath: string) {
  console.log(`🔍 Checking license in: ${path.resolve(projectPath)}\n`);

  // Find LICENSE file
  const licenseFile = findLicenseFile(projectPath);
  
  if (!licenseFile) {
    console.log('❌ No LICENSE file found!\n');
    console.log('📝 Common license file names:');
    console.log('   • LICENSE');
    console.log('   • LICENSE.md');
    console.log('   • LICENSE.txt');
    console.log('   • COPYING\n');
    console.log('💡 Tip: Add a LICENSE file to your project root.\n');
    process.exit(1);
  }

  console.log(`✅ Found license file: ${licenseFile}\n`);

  // Read license content
  const licenseContent = fs.readFileSync(path.join(projectPath, licenseFile), 'utf-8');

  // Detect license
  const detectedLicense = detectLicense(licenseContent);

  if (detectedLicense) {
    displayLicenseInfo(detectedLicense, licenseContent);
  } else {
    displayUnknownLicense(licenseContent);
  }

  // Check package.json
  checkPackageJson(projectPath);
}

function findLicenseFile(projectPath: string): string | null {
  const possibleNames = [
    'LICENSE',
    'LICENSE.md',
    'LICENSE.txt',
    'LICENCE',
    'LICENCE.md',
    'LICENCE.txt',
    'COPYING',
    'COPYING.md',
    'COPYING.txt'
  ];

  for (const name of possibleNames) {
    const filePath = path.join(projectPath, name);
    if (fs.existsSync(filePath)) {
      return name;
    }
  }

  return null;
}

function detectLicense(content: string): OSILicense | null {
  const normalizedContent = content.toLowerCase();

  for (const license of OSI_LICENSES) {
    let matchCount = 0;
    for (const keyword of license.keywords) {
      if (normalizedContent.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // If at least 2 keywords match, consider it a match
    if (matchCount >= 2) {
      return license;
    }
  }

  return null;
}

function displayLicenseInfo(license: OSILicense, content: string) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                        ✅ LICENSE DETECTED');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log(`📜 License Name: ${license.name}`);
  console.log(`🆔 License ID: ${license.id}`);
  console.log(`🔗 OSI URL: ${license.url}`);
  console.log(`✅ Status: OSI-Approved ✓\n`);

  console.log('📊 License Details:\n');
  
  // Extract copyright info
  const copyrightMatch = content.match(/Copyright \(c\) (\d{4}(-\d{4})?),?\s*(.+)/i);
  if (copyrightMatch) {
    console.log(`   📅 Copyright Year: ${copyrightMatch[1]}`);
    console.log(`   👤 Copyright Holder: ${copyrightMatch[3].trim()}\n`);
  }

  console.log('✅ Your license is OSI-approved and recognized!\n');
  
  displayLicenseCharacteristics(license.id);
}

function displayUnknownLicense(content: string) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                        ⚠️  UNKNOWN LICENSE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log('❌ Could not match your license to any OSI-approved license.\n');

  // Try to extract some info
  const copyrightMatch = content.match(/Copyright \(c\) (\d{4}(-\d{4})?),?\s*(.+)/i);
  if (copyrightMatch) {
    console.log('📋 Found copyright information:');
    console.log(`   📅 Year: ${copyrightMatch[1]}`);
    console.log(`   👤 Holder: ${copyrightMatch[3].trim()}\n`);
  }

  console.log('💡 Recommendations:\n');
  console.log('   1. Verify your license text matches an OSI-approved license');
  console.log('   2. Visit https://opensource.org/licenses to choose a license');
  console.log('   3. Use https://choosealicense.com for guidance\n');

  console.log('📚 Popular OSI-Approved Licenses:\n');
  OSI_LICENSES.slice(0, 5).forEach(license => {
    console.log(`   • ${license.name} (${license.id})`);
    console.log(`     ${license.url}\n`);
  });
}

function displayLicenseCharacteristics(licenseId: string) {
  console.log('📋 License Characteristics:\n');

  const characteristics: { [key: string]: string[] } = {
    'MIT': [
      '✅ Permissive license',
      '✅ Commercial use allowed',
      '✅ Modification allowed',
      '✅ Distribution allowed',
      '✅ Private use allowed',
      '⚠️  Must include license and copyright notice'
    ],
    'Apache-2.0': [
      '✅ Permissive license',
      '✅ Commercial use allowed',
      '✅ Patent grant included',
      '✅ Modification allowed',
      '⚠️  Must include license, copyright, and state changes'
    ],
    'BSD-3-Clause': [
      '✅ Permissive license',
      '✅ Commercial use allowed',
      '✅ Modification allowed',
      '⚠️  Cannot use copyright holder name for endorsement',
      '⚠️  Must include license and copyright notice'
    ],
    'BSD-2-Clause': [
      '✅ Permissive license',
      '✅ Commercial use allowed',
      '✅ Modification allowed',
      '⚠️  Must include license and copyright notice'
    ],
    'GPL-3.0': [
      '⚠️  Copyleft license',
      '✅ Commercial use allowed',
      '✅ Modification allowed',
      '⚠️  Derivative works must use same license',
      '⚠️  Must disclose source code'
    ],
    'GPL-2.0': [
      '⚠️  Copyleft license',
      '✅ Commercial use allowed',
      '✅ Modification allowed',
      '⚠️  Derivative works must use same license',
      '⚠️  Must disclose source code'
    ]
  };

  const chars = characteristics[licenseId];
  if (chars) {
    chars.forEach(char => console.log(`   ${char}`));
    console.log();
  }
}

function displayUsageGuidelines(licenseId: string, repoName: string) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                        ⚖️  USAGE GUIDELINES');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const guidelines: { [key: string]: string[] } = {
    'MIT': [
      '✅ You CAN use this code commercially',
      '✅ You CAN modify and distribute',
      '✅ You CAN use privately',
      '⚠️  You MUST include the original license and copyright notice',
      '⚠️  You MUST give credit to the original authors',
      '❌ No warranty or liability from authors'
    ],
    'Apache-2.0': [
      '✅ You CAN use this code commercially',
      '✅ You CAN modify and distribute',
      '✅ You GET patent rights from contributors',
      '⚠️  You MUST include the original license',
      '⚠️  You MUST state significant changes made',
      '⚠️  You MUST include NOTICE file if present',
      '❌ No trademark rights granted'
    ],
    'BSD-3-Clause': [
      '✅ You CAN use this code commercially',
      '✅ You CAN modify and distribute',
      '⚠️  You MUST include the original license and copyright',
      '⚠️  You CANNOT use author names for endorsement',
      '❌ No warranty or liability from authors'
    ],
    'GPL-3.0': [
      '⚠️  COPYLEFT: Your code MUST also be GPL-3.0',
      '✅ You CAN use commercially',
      '✅ You CAN modify',
      '⚠️  You MUST disclose your source code',
      '⚠️  You MUST include the original license',
      '⚠️  You MUST state changes made',
      '❌ Cannot be used in proprietary software'
    ],
    'GPL-2.0': [
      '⚠️  COPYLEFT: Your code MUST also be GPL-2.0',
      '✅ You CAN use commercially',
      '✅ You CAN modify',
      '⚠️  You MUST disclose your source code',
      '⚠️  You MUST include the original license',
      '❌ Cannot be used in proprietary software'
    ]
  };

  const guide = guidelines[licenseId];
  if (guide) {
    console.log(`📋 Guidelines for using ${repoName}:\n`);
    guide.forEach(item => console.log(`   ${item}`));
    console.log();
  }

  console.log('💡 Best Practices:\n');
  console.log('   1. Read the full license text carefully');
  console.log('   2. Keep a copy of the license in your project');
  console.log('   3. Give proper attribution to original authors');
  console.log('   4. Document any modifications you make');
  console.log('   5. Consult a lawyer for commercial use if unsure\n');

  console.log('⚠️  DISCLAIMER: This is not legal advice. Consult a lawyer for legal matters.\n');
}

function checkPackageJson(projectPath: string) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                        📦 PACKAGE.JSON CHECK');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    if (packageJson.license) {
      console.log(`✅ License field found: "${packageJson.license}"\n`);
      
      // Check if it matches detected license
      const matchesFile = OSI_LICENSES.some(l => 
        l.id === packageJson.license || l.name === packageJson.license
      );
      
      if (matchesFile) {
        console.log('✅ package.json license matches OSI-approved license\n');
      } else {
        console.log('⚠️  package.json license should use SPDX identifier\n');
        console.log('💡 Recommended format: "license": "MIT" or "license": "Apache-2.0"\n');
      }
    } else {
      console.log('⚠️  No license field in package.json\n');
      console.log('💡 Add: "license": "YOUR-LICENSE-ID" to package.json\n');
    }
  } catch (error) {
    // Ignore package.json errors
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
