"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Plus, Trash, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationSearch } from "@/components/location-search";
import { BusinessMap } from "@/components/business-map";
import { loadGoogleMapsScript } from "@/lib/google-maps";
import type { Business } from "@/types/business";

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    openingHours: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsGoogleMapsLoaded(true))
      .catch((err) => console.error("Failed to load Google Maps:", err));
  }, []);

  // Fetch businesses on component mount
  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/businesses");
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url =
        isEditing && selectedBusiness
          ? `/api/admin/businesses/${selectedBusiness.id}`
          : "/api/admin/businesses";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      // Reset form and refresh businesses
      setFormData({
        name: "",
        category: "",
        address: "",
        phone: "",
        latitude: 0,
        longitude: 0,
        openingHours: "",
      });

      setIsEditing(false);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error("Error saving business:", error);
    }
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name,
      category: business.category,
      address: business.address,
      phone: business.phone || "",
      latitude: business.latitude || 0,
      longitude: business.longitude || 0,
      openingHours: business.openingHours || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este negócio?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      fetchBusinesses();

      if (selectedBusiness?.id === id) {
        setSelectedBusiness(null);
        setIsEditing(false);
        setFormData({
          name: "",
          category: "",
          address: "",
          phone: "",
          latitude: 0,
          longitude: 0,
          openingHours: "",
        });
      }
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

      <Tabs defaultValue="list">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Lista de Negócios</TabsTrigger>
          <TabsTrigger value="add">Adicionar/Editar Negócio</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Negócios Cadastrados</h2>
              <Button onClick={fetchBusinesses} variant="outline" size="sm">
                Atualizar
              </Button>
            </div>

            {isLoading ? (
              <p className="text-center py-12 text-muted-foreground">
                Carregando...
              </p>
            ) : businesses.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                Nenhum negócio cadastrado
              </p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Nome</th>
                      <th className="text-left p-3">Categoria</th>
                      <th className="text-left p-3">Endereço</th>
                      <th className="text-left p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((business) => (
                      <tr key={business.id} className="border-t">
                        <td className="p-3">{business.name}</td>
                        <td className="p-3">{business.category}</td>
                        <td className="p-3">{business.address}</td>
                        <td className="p-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(business)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(business.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Editar Negócio" : "Adicionar Novo Negócio"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nome
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Categoria
                    </label>
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Localização
                    </label>
                    <LocationSearch
                      onLocationSelect={handleLocationSelect}
                      placeholder="Buscar endereço"
                      className="mb-2"
                    />
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Endereço completo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Latitude
                      </label>
                      <Input
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Longitude
                      </label>
                      <Input
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Telefone
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Horário de Funcionamento
                    </label>
                    <Input
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleInputChange}
                      placeholder="Ex: 09:00 - 18:00"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex items-center gap-2">
                      {isEditing ? <Save size={16} /> : <Plus size={16} />}
                      {isEditing ? "Salvar Alterações" : "Adicionar Negócio"}
                    </Button>

                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedBusiness(null);
                          setFormData({
                            name: "",
                            category: "",
                            address: "",
                            phone: "",
                            latitude: 0,
                            longitude: 0,
                            openingHours: "",
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {isGoogleMapsLoaded && (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização no Mapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <BusinessMap
                    businesses={selectedBusiness ? [selectedBusiness] : []}
                    userLocation={{
                      latitude: formData.latitude,
                      longitude: formData.longitude,
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.latitude && formData.longitude
                      ? "Localização atual do negócio"
                      : "Selecione uma localização para visualizar no mapa"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
