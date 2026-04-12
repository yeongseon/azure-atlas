BEGIN;

-- ─── Domain ───────────────────────────────────────────────────────────────────
INSERT INTO domains (domain_id, label, description, display_order, status) VALUES
('network', 'Networking', 'Azure networking fundamentals: virtual networks, connectivity, DNS, security, and routing.', 1, 'approved');

-- ─── Nodes ────────────────────────────────────────────────────────────────────
INSERT INTO nodes (node_id, domain_id, label, node_type, summary, status) VALUES
('vnet',              'network', 'Virtual Network (VNet)',       'service',  'Isolated network in Azure. Foundation for private IP connectivity between resources.',                                          'approved'),
('subnet',            'network', 'Subnet',                       'concept',  'IP address range subdivision within a VNet. Used to segment and secure resources.',                                            'approved'),
('nsg',               'network', 'Network Security Group (NSG)', 'service',  'Stateful firewall with inbound/outbound rules attached to subnets or NICs.',                                                  'approved'),
('dns-azure',         'network', 'Azure DNS',                    'service',  'Hosts DNS domains in Azure. Supports public zones and private zones for VNet-internal resolution.',                           'approved'),
('public-ip',         'network', 'Public IP Address',            'concept',  'Public IPv4/IPv6 address that can be assigned to Azure resources for internet connectivity.',                                 'approved'),
('private-endpoint',  'network', 'Private Endpoint',             'service',  'Network interface that uses a private IP from your VNet to connect privately to Azure PaaS services.',                       'approved'),
('route-table',       'network', 'Route Table (UDR)',            'service',  'Custom routing rules that override Azure default routes. Used for forced tunneling and NVA scenarios.',                       'approved'),
('private-dns',       'network', 'Private DNS Zone',             'service',  'DNS name resolution within a VNet without custom DNS. Automatically linked to VNets for private endpoint resolution.',       'approved');

-- ─── Edges ────────────────────────────────────────────────────────────────────
INSERT INTO edges (source_id, target_id, relation_type, weight, status) VALUES
('subnet',           'vnet',             'belongs_to',      1.0, 'approved'),
('nsg',              'subnet',           'attached_to',     1.0, 'approved'),
('nsg',              'vnet',             'secures',         0.8, 'approved'),
('public-ip',        'vnet',             'attached_to',     0.7, 'approved'),
('private-endpoint', 'subnet',           'belongs_to',      1.0, 'approved'),
('private-endpoint', 'private-dns',      'resolves_via',    1.0, 'approved'),
('route-table',      'subnet',           'attached_to',     1.0, 'approved'),
('private-dns',      'vnet',             'attached_to',     1.0, 'approved'),
('dns-azure',        'private-dns',      'contains',        0.9, 'approved'),
('subnet',           'route-table',      'depends_on',      0.7, 'approved');

-- ─── Evidence ─────────────────────────────────────────────────────────────────
INSERT INTO evidence (node_id, excerpt, source_url, source_title, confidence_score, status) VALUES
('vnet',
 'Azure Virtual Network (VNet) is the fundamental building block for your private network in Azure. VNet enables many types of Azure resources to securely communicate with each other, the internet, and on-premises networks.',
 'https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview',
 'Azure Virtual Network documentation',
 0.95, 'approved'),

('subnet',
 'Each subnet must have a unique address range, specified in CIDR notation, within the address space of the virtual network. The address range cannot overlap with other subnets within the virtual network.',
 'https://learn.microsoft.com/azure/virtual-network/virtual-network-manage-subnet',
 'Add, change, or delete a virtual network subnet',
 0.93, 'approved'),

('nsg',
 'A network security group contains security rules that allow or deny inbound network traffic to, or outbound network traffic from, several types of Azure resources. For each rule, you can specify source and destination, port, and protocol.',
 'https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview',
 'Network security groups',
 0.94, 'approved'),

('dns-azure',
 'Azure DNS allows you to host your DNS domain in Azure, so you can manage your DNS records using the same credentials, APIs, tools, and billing as your other Azure services.',
 'https://learn.microsoft.com/azure/dns/dns-overview',
 'What is Azure DNS?',
 0.92, 'approved'),

('public-ip',
 'Public IP addresses allow Internet resources to communicate inbound to Azure resources. Public IP addresses also enable Azure resources to communicate outbound to Internet and public-facing Azure services.',
 'https://learn.microsoft.com/azure/virtual-network/ip-services/public-ip-addresses',
 'Public IP addresses',
 0.91, 'approved'),

('private-endpoint',
 'A private endpoint is a network interface that uses a private IP address from your virtual network. This network interface connects you privately and securely to a service powered by Azure Private Link.',
 'https://learn.microsoft.com/azure/private-link/private-endpoint-overview',
 'What is a private endpoint?',
 0.96, 'approved'),

('route-table',
 'Azure automatically routes traffic between Azure subnets, virtual networks, and on-premises networks. If you want to change Azure''s default routing, you do so by creating a route table.',
 'https://learn.microsoft.com/azure/virtual-network/manage-route-table',
 'Create, change, or delete a route table',
 0.90, 'approved'),

('private-dns',
 'Azure Private DNS provides a reliable, secure DNS service to manage and resolve domain names in a virtual network without the need to add a custom DNS solution.',
 'https://learn.microsoft.com/azure/dns/private-dns-overview',
 'What is Azure Private DNS?',
 0.93, 'approved');

-- ─── Journeys ─────────────────────────────────────────────────────────────────
INSERT INTO journeys (journey_id, domain_id, title, description, status) VALUES
('journey-private-connectivity',
 'network',
 'Connect to Azure PaaS privately',
 'Walk through building a private connectivity pattern: VNet → Subnet → Private Endpoint → Private DNS Zone.',
 'approved'),

('journey-nsg-basics',
 'network',
 'Secure a subnet with NSG',
 'Learn how to attach an NSG to a subnet and write inbound/outbound security rules.',
 'approved'),

('journey-custom-routing',
 'network',
 'Control traffic with route tables',
 'Understand Azure default routing and override it with User Defined Routes for forced tunneling.',
 'approved');

-- ─── Journey Steps ────────────────────────────────────────────────────────────
INSERT INTO journey_steps (journey_id, node_id, step_order, narrative) VALUES
('journey-private-connectivity', 'vnet',             1, 'Start with a Virtual Network — the isolated network envelope for all your resources.'),
('journey-private-connectivity', 'subnet',           2, 'Create a dedicated subnet for private endpoints (typically named "PrivateEndpointSubnet").'),
('journey-private-connectivity', 'private-endpoint', 3, 'Deploy a Private Endpoint in the subnet to expose the PaaS service on a private IP.'),
('journey-private-connectivity', 'private-dns',      4, 'Create a Private DNS Zone and link it to the VNet so DNS queries resolve to the private IP.'),

('journey-nsg-basics', 'vnet',   1, 'Start with the VNet that contains the resources you want to protect.'),
('journey-nsg-basics', 'subnet', 2, 'Identify the subnet housing your workload VMs or services.'),
('journey-nsg-basics', 'nsg',    3, 'Create an NSG with explicit allow/deny rules, then associate it with the subnet.'),

('journey-custom-routing', 'vnet',        1, 'Understand the default system routes Azure creates for every VNet.'),
('journey-custom-routing', 'subnet',      2, 'Identify which subnet needs custom routing (e.g., the subnet with your app servers).'),
('journey-custom-routing', 'route-table', 3, 'Create a Route Table with a default route (0.0.0.0/0) pointing to your NVA or firewall, then associate it with the subnet.');

COMMIT;
