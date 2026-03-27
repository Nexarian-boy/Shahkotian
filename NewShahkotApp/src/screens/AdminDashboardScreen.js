import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { adminAPI, newsAPI, listingsAPI, reportsAPI, bazarAPI, acAPI, servicesAPI } from '../services/api';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageViewer from '../components/ImageViewer';

const { width } = Dimensions.get('window');
const TABS = ['Overview', 'Users', 'Job Posters', 'Services', 'Rishta', 'Traders', 'AC Office', 'Reports', 'News', 'Notify', 'Storage', 'App Settings'];

export default function AdminDashboardScreen({ navigation }) {
  const { loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobPosterRequests, setJobPosterRequests] = useState([]);
  const [approvedJobPosters, setApprovedJobPosters] = useState([]);
  const [rishtaProfiles, setRishtaProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allNews, setAllNews] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [dbStatus, setDbStatus] = useState([]);
  const [cloudinaryStatus, setCloudinaryStatus] = useState([]);
  const [cloudinarySwitching, setCloudinarySwitching] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState({});
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState('PENDING');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifStats, setNotifStats] = useState(null);
  const [mediaViewer, setMediaViewer] = useState(null);
  // Trader management
  const [allTraders, setAllTraders] = useState([]);
  const [pendingTraders, setPendingTraders] = useState([]);
  const [presidents, setPresidents] = useState([]);
  const [presidentForm, setPresidentForm] = useState({ name: '', email: '', password: '' });
  const [creatingPresident, setCreatingPresident] = useState(false);
  const [traderSearch, setTraderSearch] = useState('');

  // Services management
  const [servicePendingProviders, setServicePendingProviders] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceCategoryForm, setServiceCategoryForm] = useState({ name: '', emoji: '🔧' });
  const [serviceSubForms, setServiceSubForms] = useState({});
  const [serviceBusy, setServiceBusy] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsToggleLoading, setAdsToggleLoading] = useState(false);

  // AC Office management
  const [acComplainants, setAcComplainants] = useState([]);
  const [acOfficers, setAcOfficers] = useState([]);
  const [acOfficerForm, setAcOfficerForm] = useState({ name: '', designation: '', email: '', password: '' });
  const [creatingAcOfficer, setCreatingAcOfficer] = useState(false);

  // Wait for auth token to load before fetching
  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [activeTab, reportFilter, authLoading]);

  // Reset loaded state when pull-to-refresh triggers
  useEffect(() => {
    if (refreshing) {
      setDataLoaded({});
    }
  }, [refreshing]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Overview') {
        const res = await adminAPI.getDashboard();
        console.log('Dashboard data:', res.data);
        setStats(res.data);
      } else if (activeTab === 'Users') {
        const res = await adminAPI.getUsers({ search: searchQuery || undefined });
        console.log('Users data:', res.data);
        setUsers(res.data.users || []);
      } else if (activeTab === 'Job Posters') {
        const [reqRes, approvedRes] = await Promise.all([
          adminAPI.getJobPosterRequests(),
          adminAPI.getApprovedJobPosters(),
        ]);
        setJobPosterRequests(reqRes.data.requests || []);
        setApprovedJobPosters(approvedRes.data.users || []);
      } else if (activeTab === 'Rishta') {
        const res = await adminAPI.getPendingRishta();
        setRishtaProfiles(res.data.profiles || []);
      } else if (activeTab === 'News') {
        const res = await newsAPI.getAll({});
        setAllNews(res.data.news || []);
      } else if (activeTab === 'Reports') {
        const res = await reportsAPI.getAll({ status: reportFilter });
        setReports(res.data.reports || []);
      } else if (activeTab === 'Notify') {
        const res = await adminAPI.getNotificationStats();
        setNotifStats(res.data);
      } else if (activeTab === 'Traders') {
        const [allRes, pendRes, presRes] = await Promise.all([bazarAPI.getAllTraders(), bazarAPI.getPending(), bazarAPI.listPresidents()]);
        setAllTraders(allRes.data.traders || []);
        setPendingTraders(pendRes.data.traders || []);
        setPresidents(presRes.data.presidents || []);
      } else if (activeTab === 'Services') {
        const [pendingRes, categoriesRes] = await Promise.all([
          servicesAPI.adminGetPending(),
          servicesAPI.getCategories(),
        ]);
        setServicePendingProviders(pendingRes.data.providers || []);
        setServiceCategories(categoriesRes.data.categories || []);
      } else if (activeTab === 'AC Office') {
        const [compRes, offRes] = await Promise.all([acAPI.getPendingCnic(), acAPI.getOfficers()]);
        setAcComplainants(compRes.data.complainants || []);
        setAcOfficers(offRes.data.officers || []);
      } else if (activeTab === 'Storage') {
        try {
          const [dbRes, storRes, cloudRes] = await Promise.all([
            adminAPI.getDbStatus(),
            adminAPI.getStorage(),
            adminAPI.getCloudinaryStatus(),
          ]);
          console.log('DB Status:', dbRes.data);
          console.log('Storage:', storRes.data);
          console.log('Cloudinary Status:', cloudRes.data);
          setDbStatus(Array.isArray(dbRes.data?.databases) ? dbRes.data.databases : []);
          setStorageInfo(storRes.data || null);
          setCloudinaryStatus(Array.isArray(cloudRes.data?.accounts) ? cloudRes.data.accounts : []);
        } catch (storageError) {
          console.log('Storage load error:', storageError);
          // Try to load storage info even if db status fails
          try {
            const storRes = await adminAPI.getStorage();
            setStorageInfo(storRes.data || null);
          } catch (e) {
            console.log('Could not load storage info:', e);
          }
        }
      } else if (activeTab === 'App Settings') {
        const res = await adminAPI.getAdSettings();
        setAdsEnabled(res?.data?.adsEnabled !== false);
      }
    } catch (err) {
      console.log('Admin data load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      Alert.alert('Done', res.data.message);
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to update user.');
    }
  };

  const handleRishtaAction = async (id, action) => {
    const verb = action === 'approve' ? 'Approve' : 'Reject';
    Alert.alert(verb, `${verb} this rishta profile?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: verb,
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            if (action === 'approve') {
              await adminAPI.approveRishta(id);
            } else {
              await adminAPI.rejectRishta(id, 'Profile does not meet guidelines');
            }
            Alert.alert('Done', `Rishta profile ${verb.toLowerCase()}d`);
            loadData();
          } catch (err) {
            Alert.alert('Error', 'Action failed');
          }
        },
      },
    ]);
  };

  const handleApproveJobPoster = async (id) => {
    try {
      const res = await adminAPI.approveJobPoster(id);
      Alert.alert('Done', res.data?.message || 'User approved for job posting.');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to approve user.');
    }
  };

  const handleRejectOrRevokeJobPoster = async (id, mode = 'revoke') => {
    const label = mode === 'reject' ? 'Reject request' : 'Revoke permission';
    Alert.alert(label, `Are you sure you want to ${label.toLowerCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label,
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await adminAPI.revokeJobPoster(id);
            Alert.alert('Done', res.data?.message || 'Updated successfully.');
            loadData();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to update user.');
          }
        },
      },
    ]);
  };

  const handleCreateAcOfficer = async () => {
    if (!acOfficerForm.name || !acOfficerForm.email || !acOfficerForm.password) return Alert.alert('Required', 'Fill all fields');
    setCreatingAcOfficer(true);
    try {
      await acAPI.createOfficer(acOfficerForm);
      Alert.alert('Success', 'AC Officer created');
      setAcOfficerForm({ name: '', designation: '', email: '', password: '' });
      loadData();
    } catch (e) { Alert.alert('Error', e.response?.data?.error || 'Failed to create AC Officer'); }
    finally { setCreatingAcOfficer(false); }
  };

  const handleDeleteAcOfficer = (id) => {
    Alert.alert('Delete', 'Remove AC Officer profile?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await acAPI.deleteOfficer(id); loadData(); } catch { Alert.alert('Error', 'Failed to delete'); }
    } }]);
  };

  const handleApproveCnic = async (id) => {
    try { await acAPI.approveCnic(id); Alert.alert('Done', 'CNIC Approved'); loadData(); }
    catch { Alert.alert('Error', 'Failed to approve CNIC'); }
  };

  const handleRejectCnic = async (id) => {
    try { await acAPI.rejectCnic(id, 'Invalid documentation'); Alert.alert('Done', 'CNIC Rejected'); loadData(); }
    catch { Alert.alert('Error', 'Failed to reject CNIC'); }
  };

  const handleDeleteListing = (id) => {
    Alert.alert('Delete Listing', 'Remove this listing?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deleteListing(id);
            setAllListings(prev => prev.filter(l => l.id !== id));
          } catch (e) { Alert.alert('Error', 'Failed to delete.'); }
        },
      },
    ]);
  };

  const handleDeleteNews = (id) => {
    Alert.alert('Delete Article', 'Remove this article?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await newsAPI.delete(id);
            setAllNews(prev => prev.filter(n => n.id !== id));
          } catch (e) { Alert.alert('Error', 'Failed to delete.'); }
        },
      },
    ]);
  };

  const handleApproveServiceProvider = async (id) => {
    try {
      setServiceBusy(true);
      await servicesAPI.adminApproveProvider(id);
      Alert.alert('Done', 'Service provider approved.');
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to approve provider.');
    } finally {
      setServiceBusy(false);
    }
  };

  const handleRejectServiceProvider = (id) => {
    Alert.alert('Reject Provider', 'Are you sure you want to reject this provider request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            setServiceBusy(true);
            await servicesAPI.adminRejectProvider(id, 'Rejected by admin');
            Alert.alert('Done', 'Service provider rejected.');
            loadData();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || 'Failed to reject provider.');
          } finally {
            setServiceBusy(false);
          }
        },
      },
    ]);
  };

  const handleAddServiceCategory = async () => {
    if (!serviceCategoryForm.name.trim()) {
      Alert.alert('Required', 'Category name is required.');
      return;
    }
    try {
      setServiceBusy(true);
      await servicesAPI.adminAddCategory({
        name: serviceCategoryForm.name.trim(),
        emoji: serviceCategoryForm.emoji?.trim() || '🔧',
      });
      setServiceCategoryForm({ name: '', emoji: '🔧' });
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add category.');
    } finally {
      setServiceBusy(false);
    }
  };

  const handleAddServiceSubCategory = async (categoryId) => {
    const value = serviceSubForms[categoryId]?.trim();
    if (!value) {
      Alert.alert('Required', 'Sub-category name is required.');
      return;
    }
    try {
      setServiceBusy(true);
      await servicesAPI.adminAddSubCategory(categoryId, { name: value });
      setServiceSubForms((prev) => ({ ...prev, [categoryId]: '' }));
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add sub-category.');
    } finally {
      setServiceBusy(false);
    }
  };

  const handleDeleteServiceCategory = (id) => {
    Alert.alert('Delete Category', 'Delete this category and all its sub-categories?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setServiceBusy(true);
            await servicesAPI.adminDeleteCategory(id);
            loadData();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || 'Failed to delete category.');
          } finally {
            setServiceBusy(false);
          }
        },
      },
    ]);
  };

  const handleDeleteServiceSubCategory = (id) => {
    Alert.alert('Delete Sub-category', 'Delete this sub-category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setServiceBusy(true);
            await servicesAPI.adminDeleteSubCategory(id);
            loadData();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || 'Failed to delete sub-category.');
          } finally {
            setServiceBusy(false);
          }
        },
      },
    ]);
  };

  const handleCleanup = (target, label, olderThanDays = 30) => {
    Alert.alert(
      'Confirm Cleanup',
      `Delete all ${label} older than ${olderThanDays} days?\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              setCleanupLoading(true);
              const res = await adminAPI.cleanup(target, olderThanDays);
              Alert.alert('Done', `Deleted ${res.data.deletedCount || 0} records.`);
              loadData();
            } catch (e) {
              Alert.alert('Error', 'Cleanup failed.');
            } finally {
              setCleanupLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
          <Text style={styles.welcomeSub}>Here's your app at a glance</Text>
        </View>
        <Ionicons name="shield-checkmark" size={40} color={COLORS.white} style={{ opacity: 0.7 }} />
      </View>

      <Text style={styles.sectionTitle}>App Statistics</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Users" value={stats?.stats?.totalUsers ?? 0} color="#4CAF50" />
        <StatCard icon="cart" label="Listings" value={stats?.stats?.totalListings ?? 0} color="#FF9800" />
        <StatCard icon="heart" label="Pending Rishta" value={stats?.stats?.pendingRishta ?? 0} color="#E91E63" />
        <StatCard icon="trophy" label="Tournaments" value={stats?.stats?.totalTournaments ?? 0} color="#9C27B0" />
        <StatCard icon="newspaper" label="News" value={stats?.stats?.totalNews ?? 0} color="#00BCD4" />
        <StatCard icon="storefront" label="Shops" value={stats?.stats?.totalShops ?? 0} color="#795548" />
        <StatCard icon="business" label="Offices" value={stats?.stats?.totalOffices ?? 0} color="#607D8B" />
        <StatCard icon="medkit" label="Doctors" value={stats?.stats?.totalDoctors ?? 0} color="#E11D48" />
        <StatCard icon="restaurant" label="Restaurants" value={stats?.stats?.totalRestaurants ?? 0} color="#F97316" />
        <StatCard icon="shirt" label="Cloth Brands" value={stats?.stats?.totalClothBrands ?? 0} color="#8B5CF6" />
      </View>

      {stats?.stats?.pendingRishta > 0 && (
        <TouchableOpacity style={styles.alertCard} onPress={() => setActiveTab('Rishta')}>
          <Ionicons name="warning" size={22} color="#E65100" />
          <Text style={styles.alertText}>{stats.stats.pendingRishta} pending rishta approvals</Text>
          <Ionicons name="chevron-forward" size={18} color="#E65100" />
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('News & Articles')}>
          <Ionicons name="newspaper-outline" size={28} color={COLORS.primary} />
          <Text style={styles.quickBtnText}>Publish News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Tournaments')}>
          <Ionicons name="trophy-outline" size={28} color={COLORS.primary} />
          <Text style={styles.quickBtnText}>Tournaments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('GovtOffices')}>
          <Ionicons name="business-outline" size={28} color={COLORS.primary} />
          <Text style={styles.quickBtnText}>Govt Offices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Doctors')}>
          <Ionicons name="medkit-outline" size={28} color={COLORS.primary} />
          <Text style={styles.quickBtnText}>Doctors</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name, phone, email..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={loadData}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userPhone}>{item.phone} {item.email ? `• ${item.email}` : ''}</Text>
              <Text style={styles.userStats}>
                {item._count?.listings || 0} listings
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={[styles.badge, { backgroundColor: item.role === 'ADMIN' ? COLORS.error : COLORS.primary }]}>
                <Text style={styles.badgeText}>{item.role}</Text>
              </View>
              {item.role !== 'ADMIN' && (
                <TouchableOpacity
                  style={[styles.toggleBtn, { backgroundColor: item.isActive ? '#F44336' : '#4CAF50' }]}
                  onPress={() => handleToggleUser(item.id)}
                >
                  <Text style={styles.toggleBtnText}>{item.isActive ? 'Disable' : 'Enable'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="👥" text="No users found" />}
      />
    </View>
  );

  const renderRishta = () => (
    <FlatList
      data={rishtaProfiles}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.rishtaCard}>
          <View style={styles.rishtaHeader}>
            <Text style={styles.rishtaName}>{item.user?.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={{ color: '#E65100', fontSize: 12 }}>PENDING</Text>
            </View>
          </View>
          <Text style={styles.rishtaDetail}>Age: {item.age} | Gender: {item.gender}</Text>
          <Text style={styles.rishtaDetail}>Education: {item.education}</Text>
          <Text style={styles.rishtaDetail}>Occupation: {item.occupation}</Text>
          <Text style={styles.rishtaDetail}>Phone: {item.user?.phone}</Text>
          
          <Text style={styles.cnicLabel}>📋 CNIC Verification Images</Text>
          <View style={styles.cnicImagesRow}>
            {item.cnicFront && (
              <View style={styles.cnicImageContainer}>
                <Text style={styles.cnicImageLabel}>Front</Text>
                <Image source={{ uri: item.cnicFront }} style={styles.cnicImage} resizeMode="cover" />
              </View>
            )}
            {item.cnicBack && (
              <View style={styles.cnicImageContainer}>
                <Text style={styles.cnicImageLabel}>Back</Text>
                <Image source={{ uri: item.cnicBack }} style={styles.cnicImage} resizeMode="cover" />
              </View>
            )}
          </View>
          
          <View style={styles.rishtaActions}>
            <TouchableOpacity
              style={[styles.rishtaBtn, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleRishtaAction(item.id, 'approve')}
            >
              <Text style={styles.rishtaBtnText}>✅ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rishtaBtn, { backgroundColor: COLORS.error }]}
              onPress={() => handleRishtaAction(item.id, 'reject')}
            >
              <Text style={styles.rishtaBtnText}>❌ Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<EmptyState icon="✅" text="No pending approvals" />}
    />
  );

  const renderJobPosters = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <Text style={styles.sectionTitle}>Job Poster Requests ({jobPosterRequests.length})</Text>
      {jobPosterRequests.length === 0 ? (
        <EmptyState icon="📭" text="No pending job poster requests" />
      ) : (
        jobPosterRequests.map((item) => (
          <View key={item.id} style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userPhone}>{item.phone || '-'} {item.email ? `• ${item.email}` : ''}</Text>
              <Text style={styles.userStats}>Requested job posting permission</Text>
            </View>
            <View style={{ gap: 6 }}>
              <TouchableOpacity
                style={[styles.toggleBtn, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleApproveJobPoster(item.id)}
              >
                <Text style={styles.toggleBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, { backgroundColor: '#F44336' }]}
                onPress={() => handleRejectOrRevokeJobPoster(item.id, 'reject')}
              >
                <Text style={styles.toggleBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Approved Job Posters ({approvedJobPosters.length})</Text>
      {approvedJobPosters.length === 0 ? (
        <EmptyState icon="🗂️" text="No approved job posters" />
      ) : (
        approvedJobPosters.map((item) => (
          <View key={item.id} style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userPhone}>{item.phone || '-'} {item.email ? `• ${item.email}` : ''}</Text>
              <Text style={[styles.userStats, { color: '#2E7D32' }]}>Approved for posting jobs</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: '#F44336' }]}
              onPress={() => handleRejectOrRevokeJobPoster(item.id, 'revoke')}
            >
              <Text style={styles.toggleBtnText}>Revoke</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderContent = () => (
    <FlatList
      data={allListings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <Text style={styles.sectionTitle}>Marketplace Listings ({allListings.length})</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.contentCard}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {item.images?.[0] && (
              <Image source={{ uri: item.images[0] }} style={styles.contentThumb} />
            )}
            <View style={{ flex: 1, marginLeft: item.images?.[0] ? 12 : 0 }}>
              <Text style={styles.contentTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.contentSub}>Rs. {item.price} • {item.category}</Text>
              <Text style={styles.contentSub}>By: {item.user?.name || 'Unknown'}</Text>
              {item.isSold && <Text style={{ color: '#FF9800', fontSize: 12, fontWeight: '700' }}>SOLD</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.deleteSmallBtn} onPress={() => handleDeleteListing(item.id)}>
            <Text style={styles.deleteSmallText}>🗑</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<EmptyState icon="🛒" text="No listings" />}
    />
  );

  const handleCloudinarySwitch = async (index) => {
    Alert.alert('Switch Cloudinary', `Switch to Account #${index + 1}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch', onPress: async () => {
          try {
            setCloudinarySwitching(true);
            await adminAPI.switchCloudinary(index);
            const res = await adminAPI.getCloudinaryStatus();
            setCloudinaryStatus(Array.isArray(res.data?.accounts) ? res.data.accounts : []);
            Alert.alert('Done', `Switched to Cloudinary Account #${index + 1}`);
          } catch (e) {
            Alert.alert('Error', 'Failed to switch Cloudinary account.');
          } finally {
            setCloudinarySwitching(false);
          }
        }
      }
    ]);
  };

  const [dbSwitching, setDbSwitching] = useState(false);

  const handleDbSwitch = async (index) => {
    Alert.alert('Switch Database', `Switch writes to DB #${index + 1}? All databases will still be read.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch', onPress: async () => {
          try {
            setDbSwitching(true);
            await adminAPI.switchDatabase(index);
            const res = await adminAPI.getDbStatus();
            setDbStatus(Array.isArray(res.data?.databases) ? res.data.databases : []);
            Alert.alert('Done', `Writes switched to DB #${index + 1}`);
          } catch (e) {
            Alert.alert('Error', 'Failed to switch database.');
          } finally {
            setDbSwitching(false);
          }
        }
      }
    ]);
  };

  const renderStorage = () => (
    <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      {/* DB Rotation Status */}
      <Text style={styles.sectionTitle}>Database Rotation</Text>
      <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 10 }}>Auto-switches when a DB reaches 450 MB. Tap "Use" to switch manually. All DBs are read, only active DB receives writes.</Text>
      {dbStatus.length === 0 && <Text style={{ color: COLORS.textLight, marginBottom: 12 }}>Loading...</Text>}
      {dbSwitching && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 8 }} />}
      {dbStatus.map(d => (
        <View key={d.index} style={[styles.dbRow, d.isActive && styles.dbRowActive]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dbTitle}>DB #{d.index + 1} {d.isActive ? '⚡ ACTIVE' : ''}</Text>
            <View style={styles.dbBarBg}>
              <View style={[styles.dbBarFill, { width: `${Math.min(100, (d.sizeMB / 512) * 100)}%`, backgroundColor: d.sizeMB > 400 ? '#F44336' : d.sizeMB > 300 ? '#FF9800' : '#4CAF50' }]} />
            </View>
            <Text style={styles.dbSizeText}>{d.sizeMB.toFixed(1)} MB / 512 MB</Text>
          </View>
          {!d.isActive && d.isAvailable ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary, marginLeft: 10 }]}
              onPress={() => handleDbSwitch(d.index)}
              disabled={dbSwitching}
            >
              <Text style={styles.actionBtnText}>Use</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.dbDot, { backgroundColor: d.isAvailable ? '#4CAF50' : '#F44336' }]} />
          )}
        </View>
      ))}

      {/* Cloudinary Rotation Status */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Cloudinary Video Storage</Text>
      <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 10 }}>Auto-switches when monthly credits reach 20/25. Tap an account to switch manually.</Text>
      {cloudinaryStatus.length === 0 && <Text style={{ color: COLORS.textLight, marginBottom: 12 }}>Loading...</Text>}
      {cloudinarySwitching && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 8 }} />}
      {cloudinaryStatus.map((acc, i) => {
        const pct = Math.min(100, (acc.credits / (acc.limit || 25)) * 100);
        const barColor = pct >= 80 ? '#F44336' : pct >= 60 ? '#FF9800' : '#4CAF50';
        return (
          <View key={i} style={[styles.dbRow, acc.isActive && styles.dbRowActive]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dbTitle}>
                {acc.isActive ? '⚡ ' : ''}{acc.cloudName}  {acc.isActive ? 'ACTIVE' : ''}
              </Text>
              <View style={styles.dbBarBg}>
                <View style={[styles.dbBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={styles.dbSizeText}>{acc.credits !== null ? `${acc.credits.toFixed(1)} / ${acc.limit || 25} credits` : 'Unavailable'}</Text>
            </View>
            {!acc.isActive && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.primary, marginLeft: 10 }]}
                onPress={() => handleCloudinarySwitch(i)}
                disabled={cloudinarySwitching}
              >
                <Text style={styles.actionBtnText}>Use</Text>
              </TouchableOpacity>
            )}
            {acc.isActive && <View style={[styles.dbDot, { backgroundColor: '#4CAF50' }]} />}
          </View>
        );
      })}

      {/* Record Counts */}
      {storageInfo?.totals && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Record Counts</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="👥" label="Users" value={storageInfo.totals.users ?? 0} color="#4CAF50" />
            <StatCard icon="�" label="Listings" value={storageInfo.totals.listings ?? 0} color="#FF9800" />
            <StatCard icon="🔔" label="Notifications" value={storageInfo.totals.notifications ?? 0} color="#00BCD4" />
            <StatCard icon="💬" label="Chat Msgs" value={storageInfo.totals.chatMessages ?? 0} color="#795548" />
            <StatCard icon="📰" label="News" value={storageInfo.totals.news ?? 0} color="#E91E63" />
            <StatCard icon="🏆" label="Tournaments" value={storageInfo.totals.tournaments ?? 0} color="#607D8B" />
            <StatCard icon="🏥" label="Doctors" value={storageInfo.totals.doctors ?? 0} color="#E11D48" />
          </View>
        </>
      )}

      {/* Cleanup Actions */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Free Up Space</Text>
      <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12 }}>Permanently deletes old records. Images/videos on Cloudinary are NOT affected.</Text>
      {cleanupLoading && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 10 }} />}

      <CleanupBtn
        icon="💬" title="Chat Messages" subtitle="Delete messages older than 30 days"
        onPress={() => handleCleanup('chatMessages', 'chat messages', 30)} />
      <CleanupBtn
        icon="🔔" title="Notifications" subtitle="Delete notifications older than 30 days"
        onPress={() => handleCleanup('notifications', 'notifications', 30)} />
      <CleanupBtn
        icon="🔔" title="Notifications (7 days)" subtitle="More aggressive — delete older than 7 days"
        onPress={() => handleCleanup('notifications', 'notifications', 7)} />
      <CleanupBtn
        icon="💬" title="Chat Messages (7 days)" subtitle="More aggressive — delete older than 7 days"
        onPress={() => handleCleanup('chatMessages', 'chat messages', 7)} />
    </ScrollView>
  );

  const handleToggleAds = async () => {
    const nextValue = !adsEnabled;
    Alert.alert(
      nextValue ? 'Enable Ads' : 'Disable Ads',
      nextValue
        ? 'Ads will start showing again for users without a new app release.'
        : 'Ads will stop for users without a new app release.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setAdsToggleLoading(true);
              const res = await adminAPI.updateAdSettings(nextValue);
              setAdsEnabled(res?.data?.adsEnabled !== false);
              Alert.alert('Done', res?.data?.message || 'Ads setting updated.');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.error || 'Failed to update ads setting.');
            } finally {
              setAdsToggleLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderAppSettings = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <Text style={styles.sectionTitle}>Ad Controls</Text>
      <View style={styles.settingCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingTitle}>In-App Ads</Text>
          <Text style={styles.settingSubTitle}>
            {adsEnabled
              ? 'Ads are currently enabled for all users.'
              : 'Ads are currently disabled for all users.'}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: adsEnabled ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.statusPillText, { color: adsEnabled ? '#2E7D32' : '#C62828' }]}>
            {adsEnabled ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.settingActionBtn,
          { backgroundColor: adsEnabled ? '#F44336' : '#2E7D32', opacity: adsToggleLoading ? 0.7 : 1 },
        ]}
        disabled={adsToggleLoading}
        onPress={handleToggleAds}
      >
        {adsToggleLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.settingActionBtnText}>{adsEnabled ? 'Disable Ads' : 'Enable Ads'}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.settingHint}>
        This setting is applied remotely, so users do not need to install a new app version.
      </Text>
    </ScrollView>
  );

  const renderNews = () => (
    <FlatList
      data={allNews}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View>
          <Text style={styles.sectionTitle}>Published Articles ({allNews.length})</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('News & Articles')}>
            <Text style={styles.addBtnText}>+ Publish New Article</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.contentCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.contentSub}>{item.category} • {item.reporter?.name || 'Admin'}</Text>
            <Text style={styles.contentSub}>
              {new Date(item.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.deleteSmallBtn} onPress={() => handleDeleteNews(item.id)}>
            <Text style={styles.deleteSmallText}>🗑</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<EmptyState icon="📰" text="No articles" />}
    />
  );

  const handleReportAction = async (id, action) => {
    try {
      await reportsAPI.takeAction(id, action);
      Alert.alert('Done', action === 'BLOCK' ? 'User blocked & report resolved' : 'Report dismissed');
      setReports(prev => prev.filter(r => r.id !== id));
    } catch { Alert.alert('Error', 'Action failed'); }
  };

  const renderReports = () => (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View>
          <Text style={styles.sectionTitle}>Reports ({reports.length})</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
            {['PENDING', 'RESOLVED', 'DISMISSED'].map(s => (
              <TouchableOpacity key={s} onPress={() => { setReportFilter(s); setDataLoaded(prev => ({ ...prev, Reports: false })); }}
                style={[styles.filterChip, reportFilter === s && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, reportFilter === s && styles.filterChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.contentCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentTitle}>Report #{item.id.slice(-6)}</Text>
            <Text style={styles.contentSub}>By: {item.reporter?.name || 'Unknown'}</Text>
            <Text style={styles.contentSub}>Type: {item.targetType} • Target: {item.targetId?.slice(-6)}</Text>
            <Text style={[styles.contentSub, { marginTop: 4, fontWeight: '600', color: '#C62828' }]}>Reason: {item.reason}</Text>
            {item.description ? <Text style={styles.contentSub}>Details: {item.description}</Text> : null}
            <Text style={styles.contentSub}>
              {new Date(item.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>

            {/* Context: Last 5 messages (for chat/dm reports) */}
            {item.contextMessages && item.contextMessages.length > 0 && (
              <View style={{ marginTop: 10, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 6 }}>
                  💬 Last {item.contextMessages.length} Messages:
                </Text>
                {item.contextMessages.map((msg, idx) => {
                  const isTarget = msg.id === item.targetId;
                  return (
                    <View key={msg.id || idx} style={{
                      marginBottom: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6,
                      backgroundColor: isTarget ? '#FECACA' : '#fff',
                      borderLeftWidth: isTarget ? 3 : 0, borderLeftColor: '#EF4444',
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isTarget ? '#EF4444' : '#333' }}>
                        {msg.user?.name || msg.sender?.name || 'User'}{isTarget ? ' ⚠️ REPORTED' : ''}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#444' }} numberOfLines={3}>
                        {msg.text || (msg.images?.length > 0 ? '📷 Photo' : (msg.voiceUrl ? '🎤 Voice' : '—'))}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          {reportFilter === 'PENDING' && (
            <View style={{ justifyContent: 'center', gap: 6 }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#dc3545' }]} onPress={() => handleReportAction(item.id, 'BLOCK')}>
                <Text style={styles.actionBtnText}>Block User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6c757d' }]} onPress={() => handleReportAction(item.id, 'DISMISS')}>
                <Text style={styles.actionBtnText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={<EmptyState icon="📋" text={`No ${reportFilter.toLowerCase()} reports`} />}
    />
  );

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      Alert.alert('Incomplete', 'Please enter both title and message.');
      return;
    }
    Alert.alert(
      'Send to All Users?',
      `Title: "${notifTitle}"\n\nMessage: "${notifBody}"\n\nThis will be sent to ALL active users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Now 🔔',
          onPress: async () => {
            try {
              setNotifSending(true);
              const res = await adminAPI.sendNotification({ title: notifTitle.trim(), body: notifBody.trim() });
              Alert.alert(
                'Sent! ✅',
                `Notification sent to ${res.data.inAppSaved} users.\nPush delivered: ${res.data.pushSent}\nPush-enabled devices: ${res.data.pushTokensFound}`
              );
              setNotifTitle('');
              setNotifBody('');
              // Refresh stats
              const statsRes = await adminAPI.getNotificationStats();
              setNotifStats(statsRes.data);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to send notification.');
            } finally {
              setNotifSending(false);
            }
          },
        },
      ]
    );
  };

  const renderNotifications = () => (
    <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      {/* Stats Banner */}
      {notifStats && (
        <View style={styles.notifStatsBanner}>
          <View style={styles.notifStatItem}>
            <Text style={styles.notifStatNum}>{notifStats.totalUsers}</Text>
            <Text style={styles.notifStatLabel}>Total Users</Text>
          </View>
          <View style={[styles.notifStatItem, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={styles.notifStatNum}>{notifStats.pushEnabled}</Text>
            <Text style={styles.notifStatLabel}>Push Enabled 🔔</Text>
          </View>
          <View style={[styles.notifStatItem, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={styles.notifStatNum}>{notifStats.pushDisabled}</Text>
            <Text style={styles.notifStatLabel}>No Push</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Send Push Notification</Text>
      <Text style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 16, lineHeight: 20 }}>
        Notification will appear on users' phones even when the app is closed, like WhatsApp or Instagram notifications.
      </Text>

      <View style={styles.notifInputCard}>
        <Text style={styles.notifInputLabel}>Notification Title</Text>
        <TextInput
          style={styles.notifInput}
          placeholder="e.g. Shahkot Mela 2026 🎉"
          placeholderTextColor={COLORS.textLight}
          value={notifTitle}
          onChangeText={setNotifTitle}
          maxLength={100}
        />
        <Text style={[styles.notifInputLabel, { marginTop: 12 }]}>Message</Text>
        <TextInput
          style={[styles.notifInput, { height: 100, textAlignVertical: 'top' }]}
          placeholder="e.g. Ahwal e Shahkot mein aaj raat Mela hai, zaroor aayein!"
          placeholderTextColor={COLORS.textLight}
          value={notifBody}
          onChangeText={setNotifBody}
          multiline
          maxLength={500}
        />
        <Text style={{ fontSize: 12, color: COLORS.textLight, textAlign: 'right', marginTop: 4 }}>{notifBody.length}/500</Text>
      </View>

      <TouchableOpacity
        style={[styles.sendNotifBtn, notifSending && { opacity: 0.6 }]}
        onPress={handleSendNotification}
        disabled={notifSending}
      >
        {notifSending
          ? <ActivityIndicator color="#fff" />
          : <>
              <Ionicons name="notifications" size={22} color="#fff" />
              <Text style={styles.sendNotifBtnText}>Send to All Users</Text>
            </>
        }
      </TouchableOpacity>

      <View style={styles.notifTipsCard}>
        <Text style={styles.notifTipsTitle}>💡 Tips for Good Notifications</Text>
        <Text style={styles.notifTip}>• Short title (max 50 chars) — people see this first</Text>
        <Text style={styles.notifTip}>• Message should be interesting & action-oriented</Text>
        <Text style={styles.notifTip}>• Don't send more than 2-3 per day</Text>
        <Text style={styles.notifTip}>• Works even when app is closed or in background</Text>
      </View>
    </ScrollView>
  );

  const renderServices = () => (
    <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      <Text style={styles.sectionTitle}>Pending Provider Approvals ({servicePendingProviders.length})</Text>
      {serviceBusy && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 10 }} />}

      {servicePendingProviders.length === 0 ? (
        <EmptyState icon="✅" text="No pending service providers" />
      ) : (
        servicePendingProviders.map((item) => (
          <View key={item.id} style={styles.rishtaCard}>
            <View style={styles.rishtaHeader}>
              <Text style={styles.rishtaName}>{item.user?.name || 'Provider'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
                <Text style={{ color: '#E65100', fontSize: 12 }}>PENDING</Text>
              </View>
            </View>
            <Text style={styles.rishtaDetail}>Phone: {item.phone || item.user?.phone || '-'}</Text>
            <Text style={styles.rishtaDetail}>Category: {item.category?.name || '-'}</Text>
            <Text style={styles.rishtaDetail}>Sub-category: {item.subCategory?.name || '-'}</Text>
            <Text style={styles.rishtaDetail}>Experience: {item.experience ?? 0} years</Text>
            {item.description ? <Text style={styles.rishtaDetail}>Description: {item.description}</Text> : null}

            <Text style={styles.cnicLabel}>CNIC Verification</Text>
            <View style={styles.cnicImagesRow}>
              {item.cnicFront ? (
                <TouchableOpacity style={styles.cnicImageContainer} onPress={() => setMediaViewer(item.cnicFront)}>
                  <Text style={styles.cnicImageLabel}>Front</Text>
                  <Image source={{ uri: item.cnicFront }} style={styles.cnicImage} resizeMode="cover" />
                </TouchableOpacity>
              ) : null}
              {item.cnicBack ? (
                <TouchableOpacity style={styles.cnicImageContainer} onPress={() => setMediaViewer(item.cnicBack)}>
                  <Text style={styles.cnicImageLabel}>Back</Text>
                  <Image source={{ uri: item.cnicBack }} style={styles.cnicImage} resizeMode="cover" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.rishtaActions}>
              <TouchableOpacity
                style={[styles.rishtaBtn, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleApproveServiceProvider(item.id)}
              >
                <Text style={styles.rishtaBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rishtaBtn, { backgroundColor: COLORS.error }]}
                onPress={() => handleRejectServiceProvider(item.id)}
              >
                <Text style={styles.rishtaBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Manage Categories</Text>
      <View style={{ backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontWeight: '700', color: COLORS.text, marginBottom: 8 }}>Add New Category</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.notifInput, { flex: 0.25 }]}
            placeholder="Emoji"
            value={serviceCategoryForm.emoji}
            onChangeText={(v) => setServiceCategoryForm((prev) => ({ ...prev, emoji: v }))}
          />
          <TextInput
            style={[styles.notifInput, { flex: 0.75 }]}
            placeholder="Category name"
            value={serviceCategoryForm.name}
            onChangeText={(v) => setServiceCategoryForm((prev) => ({ ...prev, name: v }))}
          />
        </View>
        <TouchableOpacity style={[styles.sendNotifBtn, { marginTop: 10 }]} onPress={handleAddServiceCategory}>
          <Text style={styles.sendNotifBtnText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {serviceCategories.map((cat) => (
        <View key={cat.id} style={[styles.userCard, { marginTop: 12, flexDirection: 'column', alignItems: 'stretch' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: COLORS.text }}>{cat.emoji} {cat.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteServiceCategory(cat.id)}>
              <Ionicons name="trash" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 8, gap: 6 }}>
            {(cat.subCategories || []).map((sub) => (
              <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}>
                <Text style={{ color: COLORS.textSecondary, flex: 1 }}>{sub.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteServiceSubCategory(sub.id)}>
                  <Ionicons name="close-circle" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TextInput
              style={[styles.notifInput, { flex: 1 }]}
              placeholder="Add sub-category"
              value={serviceSubForms[cat.id] || ''}
              onChangeText={(v) => setServiceSubForms((prev) => ({ ...prev, [cat.id]: v }))}
            />
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={() => handleAddServiceSubCategory(cat.id)}>
              <Text style={styles.actionBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  const renderTraders = () => {
    const q = traderSearch.toLowerCase();
    const filteredTraders = q ? allTraders.filter(t =>
      t.fullName?.toLowerCase().includes(q) || t.shopName?.toLowerCase().includes(q) ||
      t.phone?.includes(q) || t.bazar?.name?.toLowerCase().includes(q)
    ) : allTraders;

    return (
    <ScrollView style={{ flex: 1, padding: 12 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[COLORS.primary]} />}>
      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border }}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: COLORS.text }} placeholder="Search traders by name, shop, phone..." value={traderSearch} onChangeText={setTraderSearch} placeholderTextColor={COLORS.textLight} />
        {traderSearch.length > 0 && <TouchableOpacity onPress={() => setTraderSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textLight} /></TouchableOpacity>}
      </View>

      {/* Pending Approvals */}
      {pendingTraders.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⚠️ Pending Approvals ({pendingTraders.length})</Text>
          {pendingTraders.map(trader => (
            <View key={trader.id} style={[styles.userCard, { borderLeftWidth: 3, borderLeftColor: COLORS.warning }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {trader.photoUrl ? <Image source={{ uri: trader.photoUrl }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 10 }} /> : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray + '30', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}><Text style={{ fontSize: 18 }}>🏪</Text></View>}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14 }}>{trader.fullName}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>🏪 {trader.shopName} • {trader.bazar?.name}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textLight }}>📞 {trader.phone}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.success + '15', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }} onPress={async () => { try { await bazarAPI.approveTrader(trader.id); Alert.alert('Done', 'Trader approved'); loadData(); } catch (e) { Alert.alert('Error', 'Failed'); } }}>
                  <Text style={{ color: COLORS.success, fontWeight: '700', fontSize: 13 }}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.error + '15', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }} onPress={async () => { try { await bazarAPI.rejectTrader(trader.id); Alert.alert('Done', 'Trader rejected'); loadData(); } catch (e) { Alert.alert('Error', 'Failed'); } }}>
                  <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 13 }}>✗ Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: COLORS.error + '10', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 }} onPress={() => Alert.alert('Delete', 'Remove this trader?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await bazarAPI.deleteTrader(trader.id); loadData(); } catch (e) { Alert.alert('Error', 'Failed'); } } }])}>
                  <Ionicons name="trash" size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
      {pendingTraders.length === 0 && <Text style={{ color: COLORS.textLight, textAlign: 'center', marginVertical: 8, fontStyle: 'italic' }}>No pending requests</Text>}

      {/* All Traders */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>📊 All Traders ({filteredTraders.length}{q ? ` of ${allTraders.length}` : ''})</Text>
      {filteredTraders.map(trader => (
        <View key={trader.id} style={[styles.userCard, { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }]}>
          {trader.photoUrl ? <Image source={{ uri: trader.photoUrl }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} /> : <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray + '30', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}><Text style={{ fontSize: 14 }}>🏪</Text></View>}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 13 }}>{trader.fullName} • {trader.shopName}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{trader.bazar?.name} | <Text style={{ color: trader.status === 'APPROVED' ? COLORS.success : trader.status === 'PENDING' ? COLORS.warning : COLORS.error }}>{trader.status}</Text></Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Delete', 'Remove this trader?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await bazarAPI.deleteTrader(trader.id); loadData(); } catch (e) { Alert.alert('Error', 'Failed'); } } }])}>
            <Ionicons name="trash" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}
      {filteredTraders.length === 0 && q && <Text style={{ color: COLORS.textLight, textAlign: 'center', marginTop: 10 }}>No traders matching "{traderSearch}"</Text>}

      {/* Presidents Section */}
      <View style={{ marginTop: 20, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, elevation: 1, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>👔 Presidents ({presidents.length})</Text>
        {presidents.map(p => (
          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border + '50' }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
              <Text style={{ fontSize: 14 }}>👔</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 13 }}>{p.name}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{p.email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ backgroundColor: p.isActive ? COLORS.success + '15' : COLORS.error + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, color: p.isActive ? COLORS.success : COLORS.error, fontWeight: '600' }}>{p.isActive ? 'Active' : 'Inactive'}</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete President', `Remove ${p.name}?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await bazarAPI.deletePresident(p.id); loadData(); } catch (e) { Alert.alert('Error', 'Failed'); } } }])}>
                <Ionicons name="trash" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {presidents.length === 0 && <Text style={{ color: COLORS.textLight, textAlign: 'center', fontStyle: 'italic', marginVertical: 6 }}>No presidents yet</Text>}

        {/* Create President Form */}
        <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border }}>
          <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14, marginBottom: 8 }}>+ Create New President</Text>
          <TextInput style={styles.notifInput} placeholder="Name" value={presidentForm.name} onChangeText={v => setPresidentForm({ ...presidentForm, name: v })} placeholderTextColor={COLORS.textLight} />
          <TextInput style={[styles.notifInput, { marginTop: 8 }]} placeholder="Email" value={presidentForm.email} onChangeText={v => setPresidentForm({ ...presidentForm, email: v })} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight} />
          <TextInput style={[styles.notifInput, { marginTop: 8 }]} placeholder="Password" value={presidentForm.password} onChangeText={v => setPresidentForm({ ...presidentForm, password: v })} secureTextEntry placeholderTextColor={COLORS.textLight} />
          <TouchableOpacity style={[styles.sendNotifBtn, { marginTop: 10 }, creatingPresident && { opacity: 0.5 }]} disabled={creatingPresident} onPress={async () => {
            if (!presidentForm.name.trim() || !presidentForm.email.trim() || !presidentForm.password.trim()) { Alert.alert('Required', 'Fill all fields'); return; }
            try { setCreatingPresident(true); const res = await bazarAPI.createPresident(presidentForm); Alert.alert('Done', 'President account created'); setPresidentForm({ name: '', email: '', password: '' }); loadData(); } catch (e) { Alert.alert('Error', e.response?.data?.error || 'Failed to create president'); } finally { setCreatingPresident(false); }
          }}>
            <Text style={styles.sendNotifBtnText}>{creatingPresident ? 'Creating...' : 'Create President'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
  };

  const renderACOffice = () => (
    <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Waiting CNIC Verifications ({acComplainants.length})</Text>
      {acComplainants.map(comp => (
        <View key={comp.id} style={styles.rishtaCard}>
          <View style={styles.rishtaHeader}>
            <Text style={styles.rishtaName}>{comp.user?.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}><Text style={{ color: '#E65100', fontSize: 12 }}>PENDING</Text></View>
          </View>
          <Text style={styles.rishtaDetail}>Phone: {comp.phone}</Text>
          {comp.cnicNumber && <Text style={styles.rishtaDetail}>CNIC: {comp.cnicNumber}</Text>}
          
          <View style={styles.cnicImagesRow}>
            {comp.cnicFront && (
              <TouchableOpacity style={styles.cnicImageContainer} onPress={() => setMediaViewer(comp.cnicFront)}>
                <Text style={styles.cnicImageLabel}>Front</Text>
                <Image source={{ uri: comp.cnicFront }} style={styles.cnicImage} resizeMode="contain" />
              </TouchableOpacity>
            )}
            {comp.cnicBack && (
              <TouchableOpacity style={styles.cnicImageContainer} onPress={() => setMediaViewer(comp.cnicBack)}>
                <Text style={styles.cnicImageLabel}>Back</Text>
                <Image source={{ uri: comp.cnicBack }} style={styles.cnicImage} resizeMode="contain" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.rishtaActions}>
            <TouchableOpacity style={[styles.rishtaBtn, { backgroundColor: '#4CAF50' }]} onPress={() => handleApproveCnic(comp.id)}>
              <Text style={styles.rishtaBtnText}>✅ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rishtaBtn, { backgroundColor: COLORS.error }]} onPress={() => handleRejectCnic(comp.id)}>
              <Text style={styles.rishtaBtnText}>❌ Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>AC Officers Directory</Text>
      
      {/* Officer Creation Form */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontWeight: '700', color: COLORS.text, fontSize: 14, marginBottom: 12 }}>+ Create New AC Officer</Text>
        <TextInput style={styles.notifInput} placeholder="Officer Name" value={acOfficerForm.name} onChangeText={v => setAcOfficerForm({ ...acOfficerForm, name: v })} />
        <TextInput style={[styles.notifInput, { marginTop: 8 }]} placeholder="Designation (e.g., Assistant Commissioner)" value={acOfficerForm.designation} onChangeText={v => setAcOfficerForm({ ...acOfficerForm, designation: v })} />
        <TextInput style={[styles.notifInput, { marginTop: 8 }]} placeholder="Email Address" value={acOfficerForm.email} onChangeText={v => setAcOfficerForm({ ...acOfficerForm, email: v })} autoCapitalize="none" />
        <TextInput style={[styles.notifInput, { marginTop: 8 }]} placeholder="Password" value={acOfficerForm.password} onChangeText={v => setAcOfficerForm({ ...acOfficerForm, password: v })} secureTextEntry />
        <TouchableOpacity style={[styles.sendNotifBtn, { marginTop: 12 }, creatingAcOfficer && { opacity: 0.6 }]} onPress={handleCreateAcOfficer} disabled={creatingAcOfficer}>
          <Text style={styles.sendNotifBtnText}>{creatingAcOfficer ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>

      {/* List Officers */}
      {acOfficers.map(off => (
        <View key={off.id} style={[styles.userCard, { paddingVertical: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 15 }}>{off.name}</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginVertical: 2 }}>{off.designation}</Text>
            <Text style={{ color: COLORS.textLight, fontSize: 12 }}>{off.email}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteAcOfficer(off.id)} style={{ padding: 10 }}>
            <Ionicons name="trash" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderTab = () => {
    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    switch (activeTab) {
      case 'Overview': return renderOverview();
      case 'Users': return renderUsers();
      case 'Job Posters': return renderJobPosters();
      case 'Services': return renderServices();
      case 'Rishta': return renderRishta();
      case 'Reports': return renderReports();
      case 'Traders': return renderTraders();
      case 'AC Office': return renderACOffice();
      case 'News': return renderNews();
      case 'Notify': return renderNotifications();
      case 'Storage': return renderStorage();
      case 'App Settings': return renderAppSettings();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {renderTab()}

      {mediaViewer && (
        <ImageViewer
          visible={true}
          images={[mediaViewer]}
          initialIndex={0}
          onClose={() => setMediaViewer(null)}
        />
      )}
    </View>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, text }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function CleanupBtn({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.cleanupBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.cleanupBtnIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cleanupBtnTitle}>{title}</Text>
        <Text style={styles.cleanupBtnSub}>{subtitle}</Text>
      </View>
      <Text style={{ fontSize: 18, color: '#C62828' }}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backBtn: { color: COLORS.white, fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  tabBar: {
    backgroundColor: COLORS.surface,
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { paddingHorizontal: 20, paddingVertical: 14 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
  activeTabText: { color: COLORS.primary },
  tabContent: { flex: 1, padding: 16 },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  welcomeTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  welcomeSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 3,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 6 },
  statLabel: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    gap: 10,
  },
  alertText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#E65100' },
  alertArrow: { fontSize: 18, color: '#E65100' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickBtn: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  searchBar: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.surface },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  userPhone: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  userStats: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  toggleBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  rishtaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  rishtaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rishtaName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  rishtaDetail: { fontSize: 13, color: COLORS.textLight, marginBottom: 4 },
  cnicLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 12, marginBottom: 8 },
  cnicImagesRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  cnicImageContainer: { flex: 1 },
  cnicImageLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, textAlign: 'center' },
  cnicImage: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#E0E0E0' },
  rishtaActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rishtaBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  rishtaBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  contentThumb: { width: 50, height: 50, borderRadius: 8 },
  contentTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  contentSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  deleteSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteSmallText: { fontSize: 16 },  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 11, fontWeight: '600', color: '#666' },
  filterChipTextActive: { color: '#fff' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },  addBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: COLORS.textLight },
  // Storage tab styles
  dbRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dbRowActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  dbTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  dbBarBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 4 },
  dbBarFill: { height: 8, borderRadius: 4 },
  dbSizeText: { fontSize: 11, color: COLORS.textLight },
  dbDot: { width: 12, height: 12, borderRadius: 6, marginLeft: 12 },
  cleanupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cleanupBtnIcon: { fontSize: 22, marginRight: 12 },
  cleanupBtnTitle: { fontSize: 14, fontWeight: '700', color: '#C62828' },
  cleanupBtnSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  // ---- Notifications tab ----
  notifStatsBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
  },
  notifStatItem: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  notifStatNum: { fontSize: 26, fontWeight: '800', color: '#fff' },
  notifStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'center' },
  notifInputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  notifInputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  notifInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  sendNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 20,
    elevation: 4,
  },
  sendNotifBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  notifTipsCard: {
    backgroundColor: '#F0FFF4',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 30,
  },
  notifTipsTitle: { fontSize: 14, fontWeight: '700', color: '#2E7D32', marginBottom: 10 },
  notifTip: { fontSize: 13, color: '#388E3C', lineHeight: 22 },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  settingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  settingSubTitle: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, marginLeft: 10 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  settingActionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  settingActionBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  settingHint: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
